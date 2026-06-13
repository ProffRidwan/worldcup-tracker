import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fixtures',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fixtures.component.html',
  styleUrls: ['./fixtures.component.css']
})
export class FixturesComponent implements OnInit {
  API_TOKEN = '95fcbd3a84014286a1d461d1e2bb27ef';
  BASE_URL = '/api/v4';

  allMatches: any[] = [];
  filteredMatches: any[] = [];
  groupedMatches: { [key: string]: any[] } = {};
  loading = true;
  selectedMatchday = 1;
  matchdays = [1, 2, 3];
  stages = ['Group Stage', 'Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchFixtures();
  }

  getHeaders() {
    return { headers: new HttpHeaders({ 'X-Auth-Token': this.API_TOKEN }) };
  }

  fetchFixtures() {
    this.loading = true;
    this.http.get<any>(
      `${this.BASE_URL}/competitions/WC/matches?matchday=${this.selectedMatchday}`,
      this.getHeaders()
    ).subscribe({
      next: (data) => {
        this.allMatches = data.matches;
        this.groupByDate(data.matches);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  groupByDate(matches: any[]) {
    this.groupedMatches = {};
    matches.forEach(match => {
      const date = new Date(match.utcDate).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long'
      });
      if (!this.groupedMatches[date]) this.groupedMatches[date] = [];
      this.groupedMatches[date].push(match);
    });
  }

  getDateKeys() {
    return Object.keys(this.groupedMatches);
  }

  selectMatchday(day: number) {
    this.selectedMatchday = day;
    this.fetchFixtures();
  }

  getMatchStatus(match: any) {
    if (match.status === 'FINISHED') return 'FT';
    if (match.status === 'IN_PLAY') return 'LIVE';
    return new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getScoreDisplay(match: any) {
    if (match.status === 'FINISHED' || match.status === 'IN_PLAY') {
      return `${match.score.fullTime.home} – ${match.score.fullTime.away}`;
    }
    return 'vs';
  }
}