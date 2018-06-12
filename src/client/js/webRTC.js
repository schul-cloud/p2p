class WebRTC {

  constructor(signalFunction, stunServer) {
    this.log = debug('openhpi:webRTC');
    this.log('setup');

    this.signal = signalFunction;
    this.stunServer = stunServer;
    this.peerId = null;
    this.onRequested = null;
    this.peers = [];
    this.requests = [];

    this.message = Object.freeze({
      types: {update: 1, request: 2, chunk: 3, answer: 4},
      sizes: {
        type: 1,
        peerId: 24,
        hash: 64,
        chunkId: 8,
        chunkCount: 8,
        maxData: 65536,
      },
    });
  }

  _peerExists(peerId) {
    return this.peers.map(p => p.id).indexOf(peerId) >= 0;
  }

  _getPeer(peerId) {
    let idx = -1;

    for (let i = 0; i < this.peers.length; i++) {
      if (this.peers[i].id === peerId) {
        idx = i;
        break;
      }
    }

    if (idx >= 0)
      return this.peers[idx];
    return undefined;
  }

  _onLocalSessionCreated(peerId, desc) {
    this.log('local session created: %o', desc);

    const peer = this._getPeer(peerId);

    peer.con.setLocalDescription(desc).then(() => {
      this.log('sending local desc: %o', peer.con.localDescription);
      this.signal(peer.id, peer.con.localDescription);
    });
  }

  _getRequestId(from, hash) {
    let idx = -1;

    for (let i = 0; i < this.requests.length; i++) {
      if (this.requests[i].from === from && this.requests[i].hash === hash) {
        idx = i;
        break;
      }
    }

    return idx;
  }

  _getRequest(from, hash) {
    const idx = this._getRequestId(from, hash);

    if (idx >= 0) {
      return this.requests[idx];
    }
    return undefined;
  }

  _removeRequest(from, hash) {
    const idx = this._getRequestId(from, hash);

    if (idx >= 0) {
      this.requests = this.requests.slice(idx, 1);
    }
  }

  _onDataChannelCreated(channel) {
    this.log('onDataChannelCreated: %o', channel);

    channel.binaryType = 'arraybuffer';

    channel.onopen = () => {
      this.log('channel opened');
    };

    channel.onclose = () => {
      // Todo: signaling server broadcast to clients
      this.log('channel closed');
    };

    channel.onmessage = event => {
      this.log('received message: %o', event);

      const message = this._abToMessage(event.data);
      const types =  this.message.types;

      this.log('encoded array buffer %o', message);

      switch (message.type) {
        case types.update:
          this.refreshPeerResources(message.from, message.hash);
          break;
        case types.request:
          this.onRequested(message.hash, response => {
            const peer = this._getPeer(message.from);

            if (response.byteLength <= this.message.sizes.maxData) {
              this._sendToPeer(peer, types.answer, message.hash, response);
            } else {
              this._sendChunkedToPeer(peer, message.hash, response);
            }
          });
          break;
        case types.chunk:
          const resChunk = this._getRequest(message.from, message.hash);

          resChunk.chunks.push({id: message.chunkId, data: message.data});

          if(resChunk.chunks.length === message.chunkCount) {
            this._removeRequest(message.from, message.hash);
            resChunk.respond(this._concatMessage(resChunk.chunks));
          }
          break;
        case types.answer:
          const res = this._getRequest(message.from, message.hash);

          if (res) {
            this._removeRequest(message.from, message.hash);
            res.respond(message.data);
          } else {
            this.log('error, could not find response!?');
          }
          break;
      }
    };
  }

  _sendViaDataChannel(peer, message) {
    switch (peer.dataChannel.readyState) {
      case 'connecting':
        this.log('connection not open; queueing: %s', message);
        peer.requestQueue.push(message);
        break;
      case 'open':
        if (peer.requestQueue.length === 0) {
          peer.dataChannel.send(message);
        } else {
          peer.requestQueue.forEach(msg => peer.dataChannel.send(msg));
          peer.requestQueue = [];
        }
        break;
      case 'closing':
        this.log('attempted to send message while closing: %s', message);
        break;
      case 'closed':
        this.log('attempted to send while connection closed: %s', message);
        break;
    }
  }

  createPeerConnection(peerID, isInitiator = true) {
    this.log('creating connection as initiator? %s', isInitiator);

    const peer = {
      id: peerID,
      con: new RTCPeerConnection(this.stunServer),
      dataChannel: null,
      resources: [],
      requestQueue: [],
    };

    this.peers.push(peer);

    peer.con.onicecandidate = event => {
      this.log('icecandidate event: %o', event);

      if (event.candidate) {
        this.signal(peer.id, {
              type: 'candidate',
              label: event.candidate.sdpMLineIndex,
              id: event.candidate.sdpMid,
              candidate: event.candidate.candidate,
            },
        );
      }
    };

    if (isInitiator) {
      this.log('creating data channel');

      peer.dataChannel = peer.con.createDataChannel('data');
      this._onDataChannelCreated(peer.dataChannel);

      this.log('creating an offer');

      peer.con.createOffer().then(desc => {
        this._onLocalSessionCreated(peer.id, desc);
      });
    } else {
      peer.con.ondatachannel = event => {
        this.log('ondatachannel: %o', event.channel);

        peer.dataChannel = event.channel;
        this._onDataChannelCreated(peer.dataChannel);
      };
    }
  }

  messageCallback(peerId, message) {
    const peerExists = this._peerExists(peerId);

    if (!peerExists) {
      this.createPeerConnection(peerId, false);
    }

    const peer = this._getPeer(peerId);

    if (message.type === 'offer') {
      this.log('Got offer. Sending answer to peer.');
      peer.con.setRemoteDescription(message).then(() => {
        peer.con.createAnswer().then(desc => {
          this._onLocalSessionCreated(peer.id, desc);
        });
      });

    } else if (message.type === 'answer') {
      this.log('Got answer.');
      peer.con.setRemoteDescription(message);

    } else if (message.type === 'candidate') {
      peer.con.addIceCandidate(message).then(() => {
        this.log('Set addIceCandidate successfully');
      }).catch(e => this.log('error: %o', e));

    }
  }

  static _abTostr(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  static _strToab(input) {
    let str = input;
    if (typeof input === 'number')
      str = input.toString();

    const buf = new ArrayBuffer(str.length); // 1 bytes for each char
    const bufView = new Uint8Array(buf);

    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }

    return buf;
  }

  _concatAbs(abs) {
    let byteLength = 0;
    let length = 0;

    abs.forEach(ab => {
      byteLength += ab.byteLength;
    });

    const result = new Uint8Array(byteLength);

    abs.forEach(ab => {
      result.set(new Uint8Array(ab), length);
      length += ab.byteLength;
    });

    return result;
  }

  _abToMessage(ab) {
    const message = {
      types: null,
      from: null,
      hash: null,
      chunkId: null,
      chunkCount: null,
      data: null,
    };

    // Get type
    let chunkStart = 0;
    let chunkEnd = this.message.sizes.type;
    const typeAb = new Uint8Array(ab.slice(chunkStart, chunkEnd));

    // Get from
    chunkStart = chunkEnd;
    chunkEnd += this.message.sizes.peerId;
    const fromAb = new Uint8Array(ab.slice(chunkStart, chunkEnd));

    // Get hash
    chunkStart = chunkEnd;
    chunkEnd += this.message.sizes.hash;
    const resourceAb = new Uint8Array(ab.slice(chunkStart, chunkEnd));

    message.type = parseInt(WebRTC._abTostr(typeAb));
    message.from = WebRTC._abTostr(fromAb);
    message.hash = WebRTC._abTostr(resourceAb);

    // Get chunk
    if (message.type === this.message.types.chunk) {
      // Get chunkId
      chunkStart = chunkEnd;
      chunkEnd += this.message.sizes.chunkId;
      const chunkIdAb = new Uint8Array(ab.slice(chunkStart, chunkEnd));

      // Get chunkCount
      chunkStart = chunkEnd;
      chunkEnd += this.message.sizes.chunkCount;
      const chunkCountAb = new Uint8Array(ab.slice(chunkStart, chunkEnd));

      chunkStart = chunkEnd;
      message.data = new Uint8Array(ab.slice(chunkStart));
      message.chunkId = parseInt(WebRTC._abTostr(chunkIdAb));
      message.chunkCount = parseInt(WebRTC._abTostr(chunkCountAb));
    }

    // Get answer
    if (message.type === this.message.types.answer) {
      chunkStart = chunkEnd;
      message.data = new Uint8Array(ab.slice(chunkStart));
    }

    return message;
  }

  _sendChunkedToPeer(peer, hash, dataAb) {
    this.log('have to chunk data %s', hash);
    const s = this.message.sizes;
    const dataSize = dataAb.byteLength;
    const chunkSize = s.maxData - (s.peerId + s.hash + s.type + s.chunkId + s.chunkCount);
    const chunkCount = Math.ceil(dataSize / chunkSize);

    const applyPadding = (number, length) => {
      let result = number.toString();

      while(result.length < length) {
        result = '0' + result;
      }

      return result;
    };

    const buildChunk = (id, max, dataAb) => {
      const idAb = WebRTC._strToab(id);
      const maxAb = WebRTC._strToab(max);

      return this._concatAbs([idAb, maxAb, dataAb]);
    };

    let chunkEnd = chunkSize;
    let chunkId = 0;

    for (let i = 0; i < dataSize; i += chunkSize) {
      let chunkAb;
      if (i < dataSize) {
        chunkAb = new Uint8Array(dataAb.slice(i, chunkEnd));
      } else {
        chunkAb = new Uint8Array(dataAb.slice(i));
      }
      chunkEnd += chunkSize;

      const id = applyPadding(chunkId, s.chunkId);
      const count = applyPadding(chunkCount, s.chunkCount);
      const chunk = buildChunk(id, count, chunkAb);

      this._sendToPeer(peer, this.message.types.chunk, hash, chunk);
      chunkId += 1;
    }
    this.log('sent chunked data for %s', hash);
  }

  _concatMessage(chunks) {
    this.log('concat message');

    chunks.sort((a, b) => {
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      return 0;
    });

    const dataAbs = chunks.map(c => c.data);

    return this._concatAbs(dataAbs);
  }

  _sendToPeer(peer, msgType, hash, dataAb = undefined) {
    const typeAb = WebRTC._strToab(msgType);
    const fromAb = WebRTC._strToab(this.peerId);
    const hashAb = WebRTC._strToab(hash);

    let msg;
    if (dataAb) {
      msg = this._concatAbs([typeAb, fromAb, hashAb, dataAb]);
    } else {
      msg = this._concatAbs([typeAb, fromAb, hashAb]);
    }

    this._sendViaDataChannel(peer, msg);
  }

  updatePeers(hash) {
    this.log('broadcast peers for %s', hash);

    this.peers.forEach(peer => {
      this._sendToPeer(peer, this.message.types.update, hash);
    });
  }

  requestPeer(hash, cb) {
    this.log('try to find a peer for %s', hash);

    const peers = this.peers.filter(p => p.resources.indexOf(hash) >= 0);
    const count = peers.length;

    this.log('found %d peers', count);

    if (count > 0) {
      const randomPeerId = Math.floor(Math.random() * count);
      const peer = peers[randomPeerId];
      const request = {
        from: peer.id,
        hash: hash,
        chunks: [],
        respond: cb,
      };
      this.log('send request to other peer');
      this._sendToPeer(peer, this.message.types.request, hash);
      this.requests.push(request);
    } else {
      cb(undefined);
    }
  }

  refreshPeerResources(peerId, hash) {
    const peer = this._getPeer(peerId);

    if (!peer) {
      this.log('ERROR! Could not find peer!');
    }

    peer.resources.push(hash);

    this.log('updated peer %s with resource %s', peerId, hash);
  }

}