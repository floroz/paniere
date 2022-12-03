import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  map,
  mergeMap,
  of,
  Subject,
  tap,
} from 'rxjs';
import { GameStatus } from '../types/paniere.types';
import {
  generateRandomNumberInRange,
  getNewBoard,
} from '../utils/paniere.utils';

const MAX_SIZE = 90;
const LOCAL_STORAGE_KEY = 'paniere';
@Injectable({
  providedIn: 'root',
})
export class PaniereService {
  private _game = new Subject<undefined>();
  private _number = new Subject<number>();
  private _remaining = new BehaviorSubject<number[]>(getNewBoard(MAX_SIZE));
  private _extracted = new BehaviorSubject<number[]>([]);
  private _gameStatus = new BehaviorSubject(GameStatus.STARTING);

  number$ = this._number.asObservable();
  remaining$ = this._remaining.asObservable();
  extracted$ = this._extracted.asObservable();
  gameStatus$ = this._gameStatus.asObservable();

  constructor() {}

  start() {
    return this._game.pipe(
      mergeMap(() =>
        combineLatest([this.remaining$, this.extracted$]).pipe(
          map(([remaining, extracted]) => {
            const idx = generateRandomNumberInRange(0, remaining.length);
            const num = remaining[idx];

            const updatedExtracted = [...extracted, num];
            const updatedRemaining = [
              ...remaining.slice(0, idx),
              ...remaining.slice(idx + 1),
            ];

            return [num, updatedRemaining, updatedExtracted];
          }),
          tap(([, remaining, extracted]) =>
            // @ts-ignore
            this.saveToStorage(remaining, extracted)
          ),
          tap(([num, remaining, extracted]) => {
            // @ts-ignore
            this._number.next(num);
            // @ts-ignore
            this._remaining.next(remaining);
            // @ts-ignore
            this._extracted.next(extracted);
            // @ts-ignore
            if (!remaining.length) {
              this._gameStatus.next(GameStatus.OVER);
            } else {
              this._gameStatus.next(GameStatus.PLAYING);
            }
          })
        )
      )
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
      this._remaining.next(remaining);
      this._extracted.next(extracted);
      const isPlaying = remaining.length > 0;
      this._gameStatus.next(isPlaying ? GameStatus.PLAYING : GameStatus.OVER);
    }
  }

  reset() {
    this.deleteStorage();
    this._remaining.next(getNewBoard(MAX_SIZE));
    this._extracted.next([]);
    this._gameStatus.next(GameStatus.STARTING);
  }

  pickNumber() {
    this._game.next(undefined);
  }
}
