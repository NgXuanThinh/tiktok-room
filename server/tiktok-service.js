// server/tiktok-service.js - TikTokLiveConnector wrapper with exponential backoff reconnects
import { EventEmitter } from 'events';
import * as TikTokLib from 'tiktok-live-connector';

const LiveConnectionClass = TikTokLib.TikTokLiveConnection || TikTokLib.WebcastPushConnection || TikTokLib.default?.TikTokLiveConnection || TikTokLib.default?.WebcastPushConnection;

export class TikTokService extends EventEmitter {
  constructor() {
    super();
    this.connection = null;
    this.username = '';
    this.isConnected = false;
    this.roomId = '';
    this.viewerCount = 0;
    this.reconnectTimer = null;
    this.reconnectDelay = 2000;
    this.maxReconnectDelay = 30000;
    this.isManualDisconnect = false;
  }

  /**
   * Connect to target TikTok LIVE webcast.
   * @param {string} username - Target @uniqueId
   */
  async connect(username) {
    if (!username) throw new Error('Username is required');
    const cleanUsername = username.replace(/^@/, '').trim();
    if (this.connection && this.username === cleanUsername && this.isConnected) {
      return this.getStatus();
    }

    this.disconnect();
    this.isManualDisconnect = false;
    this.username = cleanUsername;

    try {
      this.connection = new LiveConnectionClass(this.username, {
        processInitialData: false,
        enableExtendedGiftInfo: false,
        requestPollingIntervalMs: 1000
      });

      this._bindEvents();

      const state = await this.connection.connect();
      this.isConnected = true;
      this.roomId = state?.roomId || '';
      this.reconnectDelay = 2000;

      console.log(`[TikTokService] Connected successfully to @${this.username} (Room ID: ${this.roomId})`);
      this.emit('status', this.getStatus());
      return this.getStatus();
    } catch (err) {
      this.isConnected = false;
      console.error(`[TikTokService] Connect failed for @${this.username}:`, err.message);
      this.emit('error', err);
      this._scheduleReconnect();
      throw err;
    }
  }

  /**
   * Binds webcast connection event listeners and forwards to internal EventEmitter.
   */
  _bindEvents() {
    if (!this.connection) return;

    this.connection.on('chat', (data) => this.emit('raw_event', 'chat', data));
    this.connection.on('gift', (data) => this.emit('raw_event', 'gift', data));
    this.connection.on('like', (data) => this.emit('raw_event', 'like', data));
    this.connection.on('member', (data) => this.emit('raw_event', 'member', data));
    this.connection.on('social', (data) => this.emit('raw_event', 'social', data));
    this.connection.on('follow', (data) => this.emit('raw_event', 'follow', data));
    this.connection.on('superFan', (data) => this.emit('raw_event', 'superFan', data));
    this.connection.on('superFanJoin', (data) => this.emit('raw_event', 'superFanJoin', data));

    this.connection.on('roomUser', (data) => {
      this.viewerCount = Number(data.viewerCount || data.total || this.viewerCount);
      const rawRanks = Array.isArray(data.ranks) ? data.ranks : [];
      this.lastRanks = rawRanks.map((r) => ({
        rank: Number(r.rank || 0),
        score: Number(r.score || 0),
        user: r.user || {}
      }));
      this.emit('room_ranks', {
        ranks: this.lastRanks,
        total: this.viewerCount
      });
      this.emit('status', this.getStatus());
    });

    this.connection.on('streamEnd', () => {
      this.isConnected = false;
      this.lastRanks = [];
      this.emit('streamEnd');
      this.emit('status', this.getStatus());
    });

    this.connection.on('disconnected', () => {
      this.isConnected = false;
      this.emit('status', this.getStatus());
      if (!this.isManualDisconnect) {
        this._scheduleReconnect();
      }
    });

    this.connection.on('error', (err) => {
      this.emit('error', err);
    });
  }

  /**
   * Schedules an auto-reconnect with exponential backoff up to 30s.
   */
  _scheduleReconnect() {
    if (this.reconnectTimer || this.isManualDisconnect || !this.username) return;

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.connect(this.username);
      } catch (err) {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
        this._scheduleReconnect();
      }
    }, this.reconnectDelay);
  }

  /**
   * Disconnects from current TikTok webcast.
   */
  disconnect() {
    this.isManualDisconnect = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.connection) {
      try {
        this.connection.disconnect();
      } catch (e) {}
      this.connection = null;
    }
    this.isConnected = false;
    this.emit('status', this.getStatus());
  }

  /**
   * Returns current connection status.
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      username: this.username,
      roomId: this.roomId,
      viewerCount: this.viewerCount
    };
  }
}
