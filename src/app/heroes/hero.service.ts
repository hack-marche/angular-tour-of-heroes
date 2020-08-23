import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { catchError, map, tap } from 'rxjs/operators'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import Hero from '~/app/types/hero'
import { MessageService } from '~/app/messages/message.service'

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  }

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  private heroesUrl = 'api/heroes'

  private addLog(message: string) {
    this.messageService.add(`HeroService: ${message}`)
  }

  /**
   * 失敗したHttp操作を処理します。
   * アプリを持続させます。
   * @param operation - 失敗した操作の名前
   * @param result - observableな結果として返す任意の値
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: リモート上のロギング基盤にエラーを送信する
      console.error(error) // かわりにconsoleに出力

      // TODO: ユーザーへの開示のためにエラーの変換処理を改善する
      this.addLog(`${operation} failed: ${error.message}`)

      // 空の結果を返して、アプリを持続可能にする
      return of(result as T)
    }
  }

  /** IDによりヒーローを取得する。idが見つからない場合は`undefined`を返す。 */
  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/?id=${id}`
    return this.http.get<Hero[]>(url).pipe(
      map((heroes) => heroes[0]), // {0|1} 要素の配列を返す
      tap((h) => {
        const outcome = h ? 'fetched' : 'did not find'
        this.addLog(`${outcome} hero id=${id}`)
      }),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    )
  }

  getHeroes(): Observable<Hero[]> {
    // this.messageService.add('HeroService: fetched heroes')
    // return of(HEROES)
    return this.http.get<Hero[]>(this.heroesUrl).pipe(
      tap((_) => this.addLog('fetched heroes')),
      catchError(this.handleError<Hero[]>('getHeroes', []))
    )
  }

  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`
    return this.http.get<Hero>(url).pipe(
      tap((_) => this.addLog(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    )
  }

  /** POST: サーバーに新しいヒーローを登録する */
  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.addLog(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    )
  }

  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((_) => this.addLog(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    )
  }

  /** DELETE: サーバーからヒーローを削除 */
  deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id
    const url = `${this.heroesUrl}/${id}`

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap((_) => this.addLog(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    )
  }

  /* 検索語を含むヒーローを取得する */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // 検索語がない場合、空のヒーロー配列を返す
      return of([])
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap((_) => this.addLog(`found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    )
  }
}
