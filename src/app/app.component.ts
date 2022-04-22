import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from "rxjs/operators";
import { HttpClient } from '@angular/common/http';

import { Song } from './song.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  originalItems: string[] = ["A", "B", "C", "D", "E"];
  displayedItems: string[] = this.originalItems.slice();
  searchResults: string[] = [];

  searchControl: FormControl;

  interval = 1000;

  constructor(private http: HttpClient) {
    
  }

  ngOnInit(){
    setInterval(() => {
      this.rotateArray(this.originalItems);
      let firstResult = this.searchResults.shift();
      let first = firstResult ?? this.displayedItems[0];
      this.rotateArray(this.displayedItems, first);

    }, this.interval);

    this.searchControl = new FormControl();

    this.searchControl.valueChanges.pipe(debounceTime(1000)).subscribe(res => {
      this.searchResults = [];
      this.displayedItems = this.originalItems.slice();
      this.searchItunes(res);
    });

  }

  private searchItunes(searchText: string){
    if (!searchText.trim().length){
      this.searchResults = [];
      return;
    }
    this.http.get(`https://itunes.apple.com/search?term=${searchText}`)
    .subscribe((data: any) => {
      let results = data.results as Song[];
      this.searchResults = results
                                  .filter(s => !!s.collectionName)
                                  .sort((a, b) => a.collectionName.localeCompare(b.collectionName)).slice(0, 5)
                                  .map(s => s.collectionName);
    });
  }

  private rotateArray(arr: any[], itemToPush: any = null){
    let first = arr.shift();
    arr.push(itemToPush ?? first);
  }
}
