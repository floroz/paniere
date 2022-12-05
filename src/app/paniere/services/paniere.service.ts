import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Subject, tap } from 'rxjs';
import { GameStatus } from '../types/paniere.types';
import {
  generateRandomNumberInRange,
  getNewBoard,
} from '../utils/paniere.utils';

const MAX_SIZE = 91;
const LOCAL_STORAGE_KEY = 'paniere';

type PaniereState = {
  extracted: number[];
  remaining: number[];
  lastNumber: number | null;
  status: GameStatus;
};

const initialState: PaniereState = {
  remaining: getNewBoard(MAX_SIZE),
  extracted: [],
  lastNumber: null,
  status: GameStatus.STARTING,
};

@Injectable({
  providedIn: 'root',
})
export class PaniereService {
  private _state = initialState;
  private _vm = new BehaviorSubject<PaniereState>(this._state);
  private _trigger = new Subject();

  vm$ = this._vm.asObservable();

  start() {
    return this._trigger.pipe(
      map(() => {
        const idx = generateRandomNumberInRange(
          0,
          this._state.remaining.length
        );
        const num = this._state.remaining[idx];

        const updatedExtracted = [...this._state.extracted, num];
        const updatedRemaining = [
          ...this._state.remaining.slice(0, idx),
          ...this._state.remaining.slice(idx + 1),
        ];

        return [num, updatedRemaining, updatedExtracted];
      }),
      tap(console.log),
      tap(([num, remaining, extracted]) =>
        this.saveToStorage(remaining, extracted, num)
      ),
      tap((data) => {
        const [num, remaining, extracted] = data;

        const newState: PaniereState = {
          lastNumber: num,
          remaining,
          extracted,
          status: remaining.length > 0 ? GameStatus.PLAYING : GameStatus.OVER,
        };
        this._state = { ...newState };
        this._vm.next({ ...newState });
      })
    );
  }

  private saveToStorage(
    remaining: number[],
    extracted: number[],
    lastNumber: number
  ) {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        remaining,
        extracted,
        lastNumber,
      })
    );
  }

  reset() {
    this.deleteStorage();
    this._state = {
      ...initialState,
    };

    this._vm.next({ ...this._state });
  }

  pickNumber() {
    this._trigger.next(undefined);
  }

  loadGame() {
    const loaded = this.loadFromStorage();

    if (!loaded) {
      return;
    } else {
      const { remaining, extracted, lastNumber } = loaded;

      const isPlaying = remaining.length > 0;

      const newState: PaniereState = {
        lastNumber,
        remaining,
        extracted,
        status: isPlaying ? GameStatus.PLAYING : GameStatus.OVER,
      };

      this._state = { ...newState };
      this._vm.next({ ...newState });
    }
  }

  private loadFromStorage() {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!item) return;
    return JSON.parse(item);
  }

  private deleteStorage() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}
