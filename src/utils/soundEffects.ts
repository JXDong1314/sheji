/**
 * 音效系统
 * 使用 Web Audio API 生成简单的音效
 */

class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // 点击音效
  click() {
    this.playTone(800, 0.05, 'sine', 0.2);
  }

  // 悬停音效
  hover() {
    this.playTone(600, 0.03, 'sine', 0.1);
  }

  // 成功音效 - 上升音阶
  success() {
    if (!this.enabled || !this.audioContext) return;
    
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'sine', 0.3);
      }, i * 100);
    });
  }

  // 错误音效 - 下降音阶
  error() {
    if (!this.enabled || !this.audioContext) return;
    
    const notes = [523.25, 392.00, 329.63]; // C5, G4, E4
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'square', 0.25);
      }, i * 80);
    });
  }

  // 获得分数音效
  scoreGain() {
    if (!this.enabled || !this.audioContext) return;
    
    this.playTone(880, 0.1, 'sine', 0.25);
    setTimeout(() => {
      this.playTone(1046.5, 0.15, 'sine', 0.3);
    }, 100);
  }

  // 失去分数音效
  scoreLoss() {
    if (!this.enabled || !this.audioContext) return;
    
    this.playTone(440, 0.1, 'square', 0.2);
    setTimeout(() => {
      this.playTone(329.63, 0.15, 'square', 0.25);
    }, 100);
  }

  // 成就解锁音效
  achievement() {
    if (!this.enabled || !this.audioContext) return;
    
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'sine', 0.3);
      }, i * 120);
    });
  }

  // 提示音效
  hint() {
    if (!this.enabled || !this.audioContext) return;
    
    this.playTone(1000, 0.1, 'sine', 0.2);
    setTimeout(() => {
      this.playTone(1200, 0.1, 'sine', 0.2);
    }, 150);
  }

  // 警告音效
  warning() {
    if (!this.enabled || !this.audioContext) return;
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone(800, 0.1, 'square', 0.25);
      }, i * 200);
    }
  }

  // 完成章节音效
  chapterComplete() {
    if (!this.enabled || !this.audioContext) return;
    
    const melody = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]; // C5-C6 音阶
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'sine', 0.3);
      }, i * 100);
    });
  }

  // 倒计时滴答音效
  tick() {
    this.playTone(1000, 0.05, 'square', 0.15);
  }

  // 时间紧迫警报
  timeWarning() {
    if (!this.enabled || !this.audioContext) return;
    
    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        this.playTone(1200, 0.08, 'square', 0.2);
        setTimeout(() => {
          this.playTone(1000, 0.08, 'square', 0.2);
        }, 100);
      }, i * 300);
    }
  }

  // 连接成功音效（黑箱法）
  connect() {
    if (!this.enabled || !this.audioContext) return;
    
    this.playTone(600, 0.05, 'sine', 0.2);
    setTimeout(() => {
      this.playTone(800, 0.1, 'sine', 0.25);
    }, 50);
  }

  // 断开连接音效
  disconnect() {
    if (!this.enabled || !this.audioContext) return;
    
    this.playTone(800, 0.05, 'sine', 0.2);
    setTimeout(() => {
      this.playTone(600, 0.1, 'sine', 0.15);
    }, 50);
  }

  // 匹配成功音效
  match() {
    if (!this.enabled || !this.audioContext) return;
    
    this.playTone(880, 0.08, 'sine', 0.25);
    setTimeout(() => {
      this.playTone(1046.5, 0.12, 'sine', 0.3);
    }, 80);
  }

  // 随机事件触发音效
  randomEvent() {
    if (!this.enabled || !this.audioContext) return;
    
    this.playTone(1200, 0.1, 'triangle', 0.25);
    setTimeout(() => {
      this.playTone(1000, 0.1, 'triangle', 0.2);
    }, 100);
    setTimeout(() => {
      this.playTone(1200, 0.15, 'triangle', 0.25);
    }, 200);
  }

  // 页面切换音效
  pageTransition() {
    if (!this.enabled || !this.audioContext) return;
    
    this.playTone(523.25, 0.1, 'sine', 0.2);
    setTimeout(() => {
      this.playTone(659.25, 0.15, 'sine', 0.25);
    }, 100);
  }
}

// 导出单例
export const soundEffects = new SoundEffects();
