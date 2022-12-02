import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  generateRandomNumberInRange,
  getNewBoard,
} from '../utils/paniere.utils';

@Injectable({
  providedIn: 'root',
})
export class PaniereService {
  readonly MAX_SIZE = 90;
  private readonly LOCAL_STORAGE_KEY = 'paniere';

  private _remaining: number[] = getNewBoard();
  private _extracted: number[] = [];
  private _number = new Subject<number>();
  number$ = this._number.asObservable();

  constructor() {}

  private saveToStorage() {
    localStorage.setItem(
      this.LOCAL_STORAGE_KEY,
      JSON.stringify({
        remaining: this._remaining,
        extracted: this._extracted,
      })
    );
  }

  private loadFromStorage() {
    const item = localStorage.getItem(this.LOCAL_STORAGE_KEY);

    if (!item) return;
    return JSON.parse(item);
  }

  private deleteStorage() {
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
  }

  loadGame() {
    const loaded = this.loadFromStorage();

    if (!loaded) {
      return;
    } else {
      const { remaining, extracted } = loaded;
      this._remaining = remaining;
      this._extracted = extracted;
    }
  }

  startGame() {
    this.reset();
  }

  private extractNumber() {
    const idx = generateRandomNumberInRange(0, this._remaining.length);

    const extracted = this._remaining[idx];

    // delete from remaining
    this._remaining.splice(idx, 1);

    // add to extracted
    this._extracted.push(extracted);

    this.saveToStorage();

    return extracted;
  }

  private get isGameOver() {
    return this._remaining.length < 1;
  }

  getExtracted() {
    return this._extracted.slice();
  }

  nextNumber() {
    console.log({
      over: this.isGameOver,
      remaining: this._remaining,
      extracted: this._extracted,
    });
    if (this.isGameOver) {
      //
      return;
    }

    const num = this.extractNumber();

    console.log(this._remaining);
    console.log(this._extracted);

    this._number.next(num);
  }

  private reset() {
    this.deleteStorage();
    this._remaining = getNewBoard();
    this._extracted = [];
    this._number.next(0);
  }
}
