import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-flagged-questions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flagged-questions.component.html',
  styleUrls: ['./flagged-questions.component.scss']
})
export class FlaggedQuestionsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() username: string = '';
  flaggedProblems: any[] = [];
  showNotes: { [key: string]: boolean } = {};
  private destroy$ = new Subject<void>();
  private app = initializeApp(environment.firebase);
  private database = getDatabase(this.app);

  ngOnInit(): void {
    if (!this.username){
      this.username = "VariableViking"
    }
    this.fetchFlaggedProblems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['username'] && changes['username'].currentValue) {
      // Username has changed, fetch new data
      this.fetchFlaggedProblems();
    }
  }

  fetchFlaggedProblems(): void {
    if (!this.username) return;
    console.log("This is the username:" , this.username)
    
    const problemsRef = ref(this.database, `users/${this.username}/leetcode-problems`);
    
    // Convert Firebase event to Observable
    const observable = new Observable<any>(subscriber => {
      const unsubscribe = onValue(problemsRef, (snapshot) => {
        subscriber.next(snapshot);
      });
      
      return () => unsubscribe();
    });

    // Subscribe with takeUntil for automatic cleanup
    observable
      .pipe(takeUntil(this.destroy$))
      .subscribe(snapshot => {
        const data = snapshot.val();
        console.log(data)
        if (data) {
          this.flaggedProblems = Object.entries(data).map(([key, value]: [string, any]) => ({
            id: key,
            ...value
          }));
        } else {
          this.flaggedProblems = [];
        }
      });
  }

  toggleNote(problemId: string): void {
    this.showNotes[problemId] = !this.showNotes[problemId];
  }

  async removeProblem(problemId: string): Promise<void> {
    if (!this.username) return;
    
    try {
      const problemRef = ref(this.database, `users/${this.username}/leetcode-problems/${problemId}`);
      await remove(problemRef);
      console.log('Problem removed successfully!');
    } catch (error) {
      console.error('Error removing problem:', error);
    }
  }
}
