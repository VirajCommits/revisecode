import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, get, query, orderByChild, equalTo } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';
import { environment } from '../environments/environment';
import { FlaggedQuestionsComponent } from './flagged-questions/flagged-questions.component';
import { NotePopupComponent } from './note-popup/note-popup.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FlaggedQuestionsComponent, NotePopupComponent]
})
export class AppComponent implements OnInit {
  @ViewChild('flaggedQuestions') flaggedQuestionsComponent?: FlaggedQuestionsComponent;

  fetchURL: string = "https://leetcode-api-faisalshohag.vercel.app/VariableViking"
  recentProblems: any[] = []
  showNotePopup = false;
  selectedProblem: any = null;
  showSuccessMessage = false;
  username: string = "";
  isLoading = false;
  errorMessage = "";
  private app = initializeApp(environment.firebase);
  private database = getDatabase(this.app);
  private analytics = getAnalytics(this.app);

  ngOnInit(): void {
    this.fetchData();
  }

  async fetchData() {
    try {
      this.isLoading = true;
      this.errorMessage = "";
      
      let fetchAllData = await fetch(this.fetchURL);
      if (!fetchAllData.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      let fetchDataItems = await fetchAllData.json();
      fetchDataItems = fetchDataItems.recentSubmissions;
      let filterData: any = []
      let curTitle = ""
      fetchDataItems.map((item: any) => {
        if (item.title != curTitle) {
          filterData.push(item)
          curTitle = item.title
        }
      })
      this.recentProblems = filterData;
    } catch (error) {
      this.errorMessage = "Failed to fetch user data. Please check the username and try again.";
      this.recentProblems = [];
      console.error('Error fetching data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  openNotePopup(problem: any) {
    this.selectedProblem = problem;
    this.showNotePopup = true;
  }

  closeNotePopup() {
    this.showNotePopup = false;
    this.selectedProblem = null;
  }

  getUserInfo() {
    if (!this.username.trim()) return;
    this.fetchURL = `https://leetcode-api-faisalshohag.vercel.app/${this.username.trim()}`;
    this.fetchData();
    
    // Also fetch flagged problems
    this.flaggedQuestionsComponent?.fetchFlaggedProblems();
  }

  async saveNote(note: string) {
    if(this.username === ""){
      this.username = "VariableViking"
    }
    if (!this.selectedProblem || !this.username) return;

    let url = "https://leetcode.com/problems/"
    url += this.selectedProblem.titleSlug
    url += "/description/"
    
    try {
      const problemsRef = ref(this.database, `users/${this.username}/leetcode-problems`);
      const problemsQuery = query(problemsRef, orderByChild('title'), equalTo(this.selectedProblem.title));
      const snapshot = await get(problemsQuery);
      
      if (snapshot.exists()) {
        console.log('Problem already exists in the database');
        return;
      }

      await push(problemsRef, {
        title: this.selectedProblem.title,
        url: url,
        timestamp: new Date().toISOString(),
        note: note
      });

      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);

      this.closeNotePopup();
    } catch (error) {
      console.error('Error saving problem:', error);
    }
  }
}