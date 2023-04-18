import { Component } from '@angular/core';
import { DataService } from 'src/app/services';
import { IComment, IUser } from 'src/app/models';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent {
  comments:IComment[] = [];
  currentUser:IUser = this.dataService.getCurrentUser();
  actionOnComment: IComment|null = null;
  action: Action| null = null;
  inputValue = '';
  maxId = 20;

  getButtonLabel(isEdit: boolean, isReply: boolean) {
    if(isEdit) {
      return 'UPDATE';
    } else if(isReply) {
      return 'REPLY';
    }
    return 'SEND';
  }

  showComment(comment: IComment) {
    if(this.actionOnComment?.id === comment.id) {
      const isEdit = comment.user.username === this.currentUser.username;
      if(this.action === Action.update) {
        return false;
      }
    }
    return true;
  }

  constructor(private dataService: DataService, public dialog: MatDialog) {
    this.comments = this.dataService.getComments();
    this._fillInputValueRecursively(this.comments);
  }

  private _fillInputValueRecursively(cmts: IComment[]) {
    cmts?.forEach(comment => {
      if(this.currentUser.username === comment.user.username) {
        comment.inputValue = `@${comment.user.username}, ${comment.content}`;
      } else {
        comment.inputValue = '';
      }
      this._fillInputValueRecursively(comment.replies);
    })
  }

  actionOn(action: any, comment: IComment) {
    if(action === Action.delete) {
      this._deleteConfirm(comment);
    } else {
      this.action = action;
      this.actionOnComment = comment;
    }
  }

  increaseScore(comment: IComment) {
    ++comment.score;
  }

  decreaseScore(comment: IComment) {
    --comment.score;
  }

  saveComment(comment: IComment) {
    const newInputValue = comment.inputValue;
    if(!newInputValue?.length) {
      return;
    }
    if(!comment?.id || comment.user.username !== this.currentUser.username) {
      const newComment: IComment = {
        id: ++this.maxId,
        content: newInputValue as string,
        createdAt: 'Now',
        score: 0,
        user: this.currentUser,
        replies: [],
        inputValue: '',
        replyingTo: comment?.id ? comment.user.username : ''
      }
      if(comment?.id) {
        const parentComment = this._findparentCommentRecursively(comment, this.comments);
        if(parentComment) {
          parentComment.replies = [...(parentComment?.replies ?? []), newComment];
        } else {
          comment.replies = [...(comment?.replies ?? []), newComment];
        }
      } else {
        this.comments.push(newComment);
      }
    } else {
      comment.content = newInputValue as string;
    }
    comment.inputValue = '';
    this._fillInputValueRecursively(this.comments);                       
    this.actionOnComment = null;
    this.action = null;
  }

  focusOutInput(comment: IComment) {
    if(comment.id === this.actionOnComment?.id) {
        setTimeout(() => {
            this.actionOnComment = null;
            this.action = null;
        }, 1000)
    }
  }

  private _deleteConfirm(comment: IComment): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {},
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this._removeCommentRecursively(comment, this.comments);
      }
    });
  }

  private _removeCommentRecursively(comment: IComment, cmts: IComment[]) {
    for(const idx in cmts) {
      if(cmts[idx].id === comment.id) {
        debugger;
        cmts.splice(Number(idx), 1);
        return;
      } else {
        this._removeCommentRecursively(comment, cmts[idx].replies)
      }
    }
    
  }

  private _findparentCommentRecursively(comment: IComment, cmts: IComment[]): any {
    for(const cmt of cmts) {
      if(cmt.replies?.some(c => c.id === comment.id)) {
        return cmt;
      } else {
        this._findparentCommentRecursively(comment, cmt.replies ?? []);
      }
    }
  }
}

export const enum Action {
  reply = 'REPLY',
  update = 'UPDATE',
  send = 'SEND',
  delete = 'DELETE'
}