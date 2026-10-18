import { Film } from '../models';
import { FavorisService } from './favoris.service';
import { MatchingService, SEUIL_CORRESPONDANCE } from './matching.service';
import { UtilisateurService } from './utilisateur.service';

function creerFilm(id: number, titre: string): Film {
  return {
    id: id,
    titre: titre,
    image: '',
    resume: '',
    annee: 2020,
    note: 7,
  };
}

describe('MatchingService', () => {
  let matching: MatchingService;

  beforeEach(() => {
    matching = new MatchingService(
      null as unknown as FavorisService,
      null as unknown as UtilisateurService,
    );
  });

  it('compte les films communs', () => {
    const mesFilms = [
      creerFilm(1, 'Inception'),
      creerFilm(2, 'Matrix'),
      creerFilm(3, 'Dunkirk'),
    ];
    const sesFilms = [creerFilm(3, 'Dunkirk'), creerFilm(4, 'Parasite')];

    const communs = matching.getFilmsCommuns(mesFilms, sesFilms);

    expect(communs.length).toBe(1);
    expect(communs[0].id).toBe(3);
  });

  it('renvoie aucun commun quand les listes sont disjointes', () => {
    const mesFilms = [creerFilm(1, 'A'), creerFilm(2, 'B')];
    const sesFilms = [creerFilm(3, 'C'), creerFilm(4, 'D')];

    expect(matching.getFilmsCommuns(mesFilms, sesFilms).length).toBe(0);
  });

  it('calcule le taux avec le coefficient de Dice', () => {
    const mesFilms = [
      creerFilm(1, 'A'),
      creerFilm(2, 'B'),
      creerFilm(3, 'C'),
      creerFilm(4, 'D'),
      creerFilm(5, 'E'),
    ];
    const sesFilms = [creerFilm(1, 'A'), creerFilm(2, 'B'), creerFilm(3, 'C'), creerFilm(4, 'D')];

    expect(matching.calculerTaux(mesFilms, sesFilms)).toBe(89);
  });

  it('renvoie 0 quand ma liste est vide', () => {
    expect(matching.calculerTaux([], [creerFilm(1, 'A')])).toBe(0);
  });

  it('renvoie 0 quand la liste de lautre est vide', () => {
    expect(matching.calculerTaux([creerFilm(1, 'A')], [])).toBe(0);
  });

  it('renvoie 100 quand les listes sont identiques', () => {
    const films = [creerFilm(1, 'A'), creerFilm(2, 'B'), creerFilm(3, 'C')];

    expect(matching.calculerTaux(films, films)).toBe(100);
  });

  it('donne le meme taux dans les deux sens', () => {
    const a = [creerFilm(1, 'A'), creerFilm(2, 'B'), creerFilm(3, 'C'), creerFilm(4, 'D')];
    const b = [creerFilm(1, 'A'), creerFilm(2, 'B'), creerFilm(3, 'E')];

    expect(matching.calculerTaux(a, b)).toBe(matching.calculerTaux(b, a));
  });

  it('penalise une liste qui est un sous-ensemble de lautre', () => {
    const longue = [
      creerFilm(1, 'A'),
      creerFilm(2, 'B'),
      creerFilm(3, 'C'),
      creerFilm(4, 'D'),
      creerFilm(5, 'E'),
    ];
    const courte = [creerFilm(1, 'A'), creerFilm(2, 'B'), creerFilm(3, 'C')];

    expect(matching.calculerTaux(courte, longue)).toBeLessThan(100);
    expect(matching.calculerTaux(courte, longue)).toBe(75);
  });

  it('atteint 75 pile pour un sous-ensemble de 5 et 3', () => {
    const mesFilms = [
      creerFilm(1, 'A'),
      creerFilm(2, 'B'),
      creerFilm(3, 'C'),
      creerFilm(4, 'D'),
      creerFilm(5, 'E'),
    ];
    const sesFilms = [creerFilm(1, 'A'), creerFilm(2, 'B'), creerFilm(3, 'C')];

    expect(matching.calculerTaux(mesFilms, sesFilms)).toBe(75);
    expect(matching.calculerTaux(mesFilms, sesFilms)).toBeLessThanOrEqual(SEUIL_CORRESPONDANCE);
  });

  it('utilise un seuil de 75 pour cent', () => {
    expect(SEUIL_CORRESPONDANCE).toBe(75);
  });

  it('conserve l ordre du tableau d films communs', () => {
    const mesFilms = [creerFilm(1, 'A'), creerFilm(2, 'B'), creerFilm(3, 'C')];
    const sesFilms = [creerFilm(3, 'C'), creerFilm(1, 'A')];

    const communs = matching.getFilmsCommuns(mesFilms, sesFilms);

    expect(communs.map((f) => f.id)).toEqual([1, 3]);
  });
});