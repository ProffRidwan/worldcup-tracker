import { Component, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FixturesComponent } from './fixtures/fixtures.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FixturesComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
private refreshInterval: any;

  API_TOKEN = '95fcbd3a84014286a1d461d1e2bb27ef';
  BASE_URL = '/api/v4';
  currentPage = 'home';

  standings: any[] = [];
  matches: any[] = [];
  loadingStandings = true;
  loadingMatches = true;
  selectedGroup = 'A';
  groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];
  today = new Date().toLocaleDateString('en-GB', { 
  weekday: 'long', day: 'numeric', month: 'long' 
});

  constructor(private http: HttpClient) {
    this.fetchStandings();
    this.fetchTodayMatches();

 this.refreshInterval = setInterval(() => {
  this.fetchTodayMatches();
  this.fetchStandings();
}, 30000);
  }

  getHeaders() {
    return { headers: new HttpHeaders({ 'X-Auth-Token': this.API_TOKEN }) };
  }

  fetchStandings() {
    this.loadingStandings = true;
    this.http.get<any>(`${this.BASE_URL}/competitions/WC/standings`, this.getHeaders())
      .subscribe({
        next: (data) => {
          this.standings = data.standings;
          this.loadingStandings = false;
        },
        error: () => this.loadingStandings = false
      });
  }

fetchTodayMatches() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  this.http.get<any>(
    `${this.BASE_URL}/competitions/WC/matches?dateFrom=${today}&dateTo=${today}`,
    this.getHeaders()
  ).subscribe({
    next: (data) => {
      this.matches = data.matches;
      this.loadingMatches = false;
    },
    error: () => this.loadingMatches = false
  });
}
  getGroupStandings() {
    const group = this.standings.find(s => s.group === `Group ${this.selectedGroup}`);
    return group ? group.table : [];
  }

  getMatchStatus(match: any) {
    if (match.status === 'FINISHED') return 'FT';
    if (match.status === 'IN_PLAY') return 'LIVE';
    return new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  ngOnDestroy() {
  if (this.refreshInterval) clearInterval(this.refreshInterval);
}
}