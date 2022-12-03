import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Subject, tap } from 'rxjs';
import { GameStatus } from '../types/paniere.types';
import {
  generateRandomNumberInRange,
  getNewBoard,
} from '../utils/paniere.utils';

const MAX_SIZE = 91;
const LOCAL_STORAGE_KEY = 'paniere';

@Injectable({
  providedIn: 'root',
})
export class PaniereService {
  private extracted: number[] = [];
  private remaining = getNewBoard(MAX_SIZE);

  private _game = new Subject<undefined>();

  private _number = new BehaviorSubject<number>(0);
  private _remaining = new BehaviorSubject<number[]>(this.remaining);
  private _extracted = new BehaviorSubject<number[]>(this.extracted);
  private _gameStatus = new BehaviorSubject(GameStatus.STARTING);

  readonly number$ = this._number.asObservable();
  readonly remaining$ = this._remaining.asObservable();
  readonly extracted$ = this._extracted.asObservable();
  readonly gameStatus$ = this._gameStatus.asObservable();

  start() {
    return this._game.pipe(
      map(() => {
        const idx = generateRandomNumberInRange(0, this.remaining.length);
        const num = this.remaining[idx];

        const updatedExtracted = [...this.extracted, num];
        const updatedRemaining = [
          ...this.remaining.slice(0, idx),
          ...this.remaining.slice(idx + 1),
        ];

        return [num, updatedRemaining, updatedExtracted];
      }),
      tap(console.log),
      tap(([, remaining, extracted]) =>
        this.saveToStorage(remaining, extracted)
      ),
      tap((data) => {
        const [num, remaining, extracted] = data;
        this._number.next(num);
        this.remaining = [...remaining];
        this._remaining.next(remaining);
        this.extracted = [...extracted];
        this._extracted.next(extracted);
        if (!remaining.length) {
          this._gameStatus.next(GameStatus.OVER);
        } else {
          this._gameStatus.next(GameStatus.PLAYING);
        }
      })
    );
  }

  private saveToStorage(remaining: number[], extracted: number[]) {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        remaining,
        extracted,
      })
    );
  }

  private loadFromStorage() {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!item) return;
    return JSON.parse(item);
  }

  private deleteStorage() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  loadGame() {
    const loaded = this.loadFromStorage();

    if (!loaded) {
      return;
    } else {
      const { remaining, extracted } = loaded;
      this.remaining = remaining;
      this.extracted = extracted;
      this._remaining.next(remaining);
      this._extracted.next(extracted);
      const isPlaying = remaining.length > 0;
      this._gameStatus.next(isPlaying ? GameStatus.PLAYING : GameStatus.OVER);
    }
  }

  reset() {
    this.deleteStorage();
    this.remaining = getNewBoard(MAX_SIZE);
    this._number.next(0);
    this.extracted = [];
    this._remaining.next(this.remaining);
    this._extracted.next([]);
    this._gameStatus.next(GameStatus.STARTING);
  }

  pickNumber() {
    this._game.next(undefined);
  }
}
