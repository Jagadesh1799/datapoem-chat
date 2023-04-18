import { Component, Inject, Injectable, inject } from '@angular/core';
import { chatData } from '../data/data';
import { IComment, IUser } from '../models';

@Injectable()
export class DataService {
  data = chatData;

  getComments(): IComment[] {
    return this.data.comments as IComment[];
  }

  getCurrentUser(): IUser {
    return this.data.currentUser;
  }
}
