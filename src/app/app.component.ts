import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  API_TOKEN = '95fcbd3a84014286a1d461d1e2bb27ef';
  // BASE_URL = 'https://api.football-data.org/v4';
  BASE_URL = '/api/v4';

  standings: any[] = [];
  matches: any[] = [];
  loadingStandings = true;
  loadingMatches = true;
  selectedGroup = 'A';
  groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];
  today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  constructor(private http: HttpClient) {
    this.fetchStandings();
    this.fetchTodayMatches();
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
    const today = new Date().toISOString().split('T')[0];
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
}