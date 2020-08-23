import { Component, OnInit } from '@angular/core'
import Hero from '~/app/types/hero'
import { HeroService } from '~/app/heroes/hero.service'
// import { MessageService } from '~/app/messages/message.service'

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.scss'],
})
export class HeroesComponent implements OnInit {
  heroes: Hero[]

  constructor(private heroService: HeroService) {}

  ngOnInit() {
    this.getHeroes()
  }

  getHeroes(): void {
    this.heroService.getHeroes().subscribe((heroes) => (this.heroes = heroes))
  }
}
