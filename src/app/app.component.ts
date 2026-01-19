import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  type?: 'text' | 'options' | 'link' | 'ticket-list' | 'transaction-list' | 'input-form';
  options?: { label: string, value: string }[];
  link?: { text: string, url: string };
  tickets?: { id: string, subject: string, status: string, date: string }[];
  transactions?: { id: string, amount: string, date: string, status: string }[];
  form?: {
    action: string;
    submitLabel: string;
    fields: { key: string; label: string; type: 'text' | 'select' | 'tel'; options?: any[]; placeholder?: string }[];
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'crypBooking';
  showHeader = true;

  showReferralTooltip = true; // tooltip open by default
  copied = false;

  showChatbot = false;

  // State for Country Code
  selectedCountryCode: string = '+91';
  currentUser: any = null;

  chatOptions = [
    { id: 1, label: 'Discount & Offers', icon: 'fas fa-percentage', value: 'DISCOUNT_MAIN' },
    { id: 2, label: 'My Account Help', icon: 'fas fa-user-circle', value: 'ACCOUNT_HELP' },
    { id: 3, label: 'Track Existing Ticket', icon: 'fas fa-ticket-alt', value: 'TRACK_TICKET' },
    { id: 4, label: 'Wallet Support', icon: 'fas fa-wallet', value: 'WALLET_SUPPORT' },
    { id: 5, label: 'Transaction Issues', icon: 'fas fa-exchange-alt', value: 'TRANSACTION_ISSUES' }
  ];

  messages: ChatMessage[] = [
    { text: 'Hello! How can I help you today?', sender: 'bot' }
  ];

  @ViewChild('chatScrollContainer') private chatContainer!: ElementRef;

  // Example referral code
  referralCode: any = '';
  referralLink = ``;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide header on login or register (signup) pages
      if (event.url.includes('/login') || event.url.includes('/register') || event.url.includes('/signup')) {
        this.showHeader = false;
      } else {
        this.showHeader = true;
      }
    });
  }

  ngOnInit() {
    this.referralCode = localStorage.getItem('referral') || 'CRYPTO123';
    this.referralLink = `${window.location.origin}/signup?ref=${this.referralCode}`;

    // Get User Data
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }

    // Check if user came from a referral link
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const urlTree = this.router.parseUrl(this.router.url);
        if (urlTree.queryParams['ref']) {
          localStorage.setItem('referral_source', urlTree.queryParams['ref']);
        }
      }
    });
  }

  toggleReferralTooltip() {
    this.referralCode = localStorage.getItem('referral');
    this.referralLink = `${window.location.origin}/signup?ref=${this.referralCode}`;
    this.showReferralTooltip = !this.showReferralTooltip;
  }

  closeReferralTooltip() {
    this.showReferralTooltip = false;
  }

  toggleChatbot() {
    this.showChatbot = !this.showChatbot;
  }

  handleOptionClick(option: any) {
    // Add user message
    this.messages.push({ text: option.label, sender: 'user' });
    this.scrollToBottom();

    // Determine Bot Response
    setTimeout(() => {
      this.processBotResponse(option);
    }, 500);
  }

  processBotResponse(option: any) {
    let botMsg: ChatMessage = { text: '', sender: 'bot' };

    switch (option.value) {
      // --- 1. Discount Flow ---
      case 'DISCOUNT_MAIN':
        botMsg.text = "Please select an issue related to discounts:";
        botMsg.type = 'options';
        botMsg.options = [
          { label: 'Where to apply for discount', value: 'DISCOUNT_WHERE' },
          { label: 'Booking ID issue', value: 'DISCOUNT_BOOKING_ID' },
          { label: 'For discount apply issue', value: 'DISCOUNT_APPLY_ISSUE' }
        ];
        break;
      case 'DISCOUNT_WHERE':
        botMsg.text = "Click on the below link to apply:";
        botMsg.type = 'link';
        botMsg.link = { text: 'Get Discount', url: '/get-discount' };
        break;
      case 'DISCOUNT_BOOKING_ID':
        botMsg.text = "Enter your booking id with screenshot or file upload of booking statement, of our trusted partner.";
        break;
      case 'DISCOUNT_APPLY_ISSUE':
        botMsg.text = "Please raise the ticket via click on this link:";
        botMsg.type = 'link';
        botMsg.link = { text: 'Raise Ticket', url: '/support' };
        break;

      // --- 2. My Account Help ---
      case 'ACCOUNT_HELP':
        botMsg.text = "Please raise the ticket and set redirect url of /support.";
        botMsg.type = 'link';
        botMsg.link = { text: 'Raise Ticket', url: '/support' };
        break;

      // --- 3. Track Existing Ticket ---
      case 'TRACK_TICKET':
        botMsg.text = "Here are your raised tickets:";
        botMsg.type = 'ticket-list';
        botMsg.tickets = [
          { id: '#TKT-1023', subject: 'Login Issue', status: 'Pending', date: 'Jan 15, 2024' },
          { id: '#TKT-0998', subject: 'Refund Request', status: 'Resolved', date: 'Jan 10, 2024' },
          { id: '#TKT-0850', subject: 'Wallet Topup', status: 'Closed', date: 'Dec 25, 2023' }
        ];
        break;

      // --- 4. Wallet Support ---
      case 'WALLET_SUPPORT':
        botMsg.text = "Please choose an option for wallet support:";
        botMsg.type = 'options';
        botMsg.options = [
          { label: 'Raise Ticket', value: 'WALLET_RAISE_TICKET' },
          { label: 'Urgent Support', value: 'WALLET_URGENT' }
        ];
        break;
      case 'WALLET_RAISE_TICKET':
        botMsg.text = "Click below to raise a ticket:";
        botMsg.type = 'link';
        botMsg.link = { text: 'Raise Ticket', url: '/support' };
        break;
      case 'WALLET_URGENT':
        botMsg.text = "Please provide your details for urgent callback:";
        botMsg.type = 'input-form';
        botMsg.form = {
          action: 'SUBMIT_URGENT_SUPPORT',
          submitLabel: 'Request Callback',
          fields: [
            {
              key: 'country',
              label: 'Select Country',
              type: 'select',
              options: [
                { label: 'India (+91)', value: '+91' },
                { label: 'USA (+1)', value: '+1' },
                { label: 'UK (+44)', value: '+44' },
                { label: 'UAE (+971)', value: '+971' },
                { label: 'Australia (+61)', value: '+61' }
              ]
            },
            { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Enter Mobile Number' }
          ]
        };
        break;

      // --- 5. Transaction Issues ---
      case 'TRANSACTION_ISSUES':
        botMsg.text = "Here are your recent transactions:";
        botMsg.type = 'transaction-list';
        botMsg.transactions = [
          { id: 'TXN-998877', amount: '$450.00', status: 'Completed', date: 'Jan 16, 2024' },
          { id: 'TXN-998876', amount: '$120.00', status: 'Pending', date: 'Jan 15, 2024' },
          { id: 'TXN-998870', amount: '$1200.00', status: 'Failed', date: 'Jan 12, 2024' }
        ];
        // Trigger secondary message for input form after a delay
        setTimeout(() => {
          this.messages.push({
            text: "Please enter the Transaction ID you are facing issues with:",
            sender: 'bot',
            type: 'input-form',
            form: {
              action: 'SUBMIT_TXN_ISSUE',
              submitLabel: 'Submit Issue',
              fields: [
                { key: 'txnId', label: 'Transaction ID', type: 'text', placeholder: 'Enter TXN ID' }
              ]
            }
          });
          this.scrollToBottom();
        }, 1000);
        break;

      default:
        botMsg.text = 'I can help you with ' + option.label + '. (Logic coming soon)';
    }

    this.messages.push(botMsg);
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.chatContainer) {
          // Select all chat messages inside the container
          const messages = this.chatContainer.nativeElement.querySelectorAll('.chat-message');
          if (messages.length > 0) {
            // Scroll the last message into view
            const lastMessage = messages[messages.length - 1];
            lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            // Fallback for empty history (or just suggestions)
            this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
          }
        }
      } catch (err) { }
    }, 100);
  }

  handleFormSubmit(action: string, formData: any) {
    if (action === 'SUBMIT_URGENT_SUPPORT') {
      // WhatsApp Logic
      let user = { name: 'Guest User', email: 'Not Logged In' };

      // Try to use loaded user
      if (this.currentUser) {
        user.name = this.currentUser.name || this.currentUser.firstName || 'Unknown User';
        user.email = this.currentUser.email || 'No Email';
      } else {
        // Double check local storage if ngOnInit missed it (e.g. login happened on another tab?)
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            user.name = u.name || u.firstName || 'Unknown User';
            user.email = u.email || 'No Email';
          } catch (e) { }
        }
      }

      const countryCode = formData.country || this.selectedCountryCode;
      const fullMobile = `${countryCode} ${formData.phone}`;

      const messageText = `*New Urgent Support Request*%0AUser: ${user.name}%0AEmail: ${user.email}%0AMobile: ${fullMobile}`;
      const whatsappUrl = `https://wa.me/919016566824?text=${messageText}`;

      window.open(whatsappUrl, '_blank');
    }

    const thankYouMsg = "Thank you, our team will contact you soon.";
    this.messages.push({ text: thankYouMsg, sender: 'bot' });
    this.scrollToBottom();
  }

  copyReferralLink() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Modern browsers, HTTPS or localhost
      navigator.clipboard.writeText(this.referralLink).then(() => {
        this.showCopiedMessage();
      }).catch(err => {
        console.error('Failed to copy!', err);
      });
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = this.referralLink;
      textarea.style.position = 'fixed';  // avoid scrolling to bottom
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          this.showCopiedMessage();
        } else {
          console.error('Fallback: Copy command failed');
        }
      } catch (err) {
        console.error('Fallback: Unable to copy', err);
      }

      document.body.removeChild(textarea);
    }
  }

  showCopiedMessage() {
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

}
