import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_models/message';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
    member: Member;
    galleryOptions: NgxGalleryOptions[];
    galleryImages: NgxGalleryImage[];
    @ViewChild('memberTabs') memberTabs: TabsetComponent;
    activeTab: TabDirective;
    messages: Message[] = [];

  constructor(private membersService: MembersService, private route: ActivatedRoute, private messageService: MessageService) { }

  ngOnInit(): void {
      this.loadMember();

      this.galleryOptions = [
          {
              width: '500px',
              height: '500px',
              imagePercent: 100,
              thumbnailsColumns: 4,
              imageAnimation: NgxGalleryAnimation.Slide,
              preview: false
              
          }
      ]
  }

  getImages(): NgxGalleryImage[] {
    const imageUrls = [];
    for(const photo of this.member.photos) {
        imageUrls.push({
            small: photo?.url,
            medium: photo?.url,
            big: photo?.url
        });
    }

    return imageUrls
  }

  loadMember() {
      this.membersService.getMember(this.route.snapshot.paramMap.get('username')).subscribe(member => {
          this.member = member;
          this.galleryImages = this.getImages();
      })
  }

  onTabActivated(data: TabDirective) {
      this.activeTab = data;
      if(this.activeTab.heading === 'Messages' && this.messages.length === 0) {
          this.loadMessages();
      }
  }

  loadMessages() {
    this.messageService.getMessageThread(this.member.username).subscribe(response => {
        this.messages = response;
    })
    }
    
    selectTab(tabId: number) {
        this.memberTabs.tabs[tabId].active = true;
    }

}
