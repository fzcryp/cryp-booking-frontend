
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {

    faqs = [
        {
            question: "Why book through Pbooking.com?",
            answer: "Pbooking.com helps you find the best travel deals while earning extra CASH BACK—up to USD 1,000 or more, depending on your booking value. Simply choose your preferred option on Pbooking.com and complete your booking securely on our trusted global partners such as Emirates, Qatar Airways, Hilton, Booking.com, Expedia, and more. You receive instant confirmation directly from the provider."
        },
        {
            question: "How do I earn CASH BACK on my booking?",
            answer: "It’s quick and easy: 1. Log in to your Pbooking.com account. 2. Search for flights, hotels, cars, or holiday packages. 3. Select your preferred booking and get redirected to our partner. 4. Complete your booking on the partner’s official website. 5. Upload your booking confirmation in your Pbooking.com account. 6. Earn CASH BACK after your trip is completed."
        },
        {
            question: "When will I receive my CASH BACK?",
            answer: "Your CASH BACK is credited within 1–4 weeks after trip completion, once the booking is confirmed by our partners."
        },
        {
            question: "Does my CASH BACK expire?",
            answer: "No. Your CASH BACK never expires and remains available in your wallet."
        },
        {
            question: "Is my booking made on Pbooking.com?",
            answer: "No. All bookings and payments are completed directly on our partners’ secure websites. Pbooking.com does not process or store any payment information."
        },
        {
            question: "Who do I contact for booking changes or cancellations?",
            answer: "For any changes, cancellations, or booking-related questions, please contact the airline, hotel, or travel provider directly using the confirmation details you received."
        },
        {
            question: "How does the wallet reward system work?",
            answer: "After completing your booking, upload your confirmation on Pbooking.com. Once verified, your eligible reward is added to your wallet, where you can track and manage your CASH BACK easily."
        },
        {
            question: "When is the wallet balance credited?",
            answer: "Wallet rewards are typically credited within 48 hours after our partners confirm the booking. Timing may vary based on partner policies."
        },
        {
            question: "Do I need an account to earn rewards?",
            answer: "Yes. You must be logged in to your Pbooking.com account to earn, track, and withdraw CASH BACK rewards."
        },
        {
            question: "Can I use my wallet balance for future bookings?",
            answer: "At this time, wallet balances cannot be used directly for new bookings. You can withdraw your wallet balance to your bank account or PayPal."
        },
        {
            question: "What happens if I cancel my booking?",
            answer: "If your booking is canceled or refunded, the related CASH BACK reward will not be credited."
        },
        {
            question: "Are my personal and payment details secure?",
            answer: "Absolutely. All payments are handled securely by our trusted partners. Pbooking.com never accesses or stores your payment information."
        },
        {
            question: "Do prices change after redirection?",
            answer: "Prices are set by our partners and may change slightly due to availability, taxes, or promotions until your booking is completed."
        },
        {
            question: "How can I contact Pbooking.com support?",
            answer: "• Booking-related questions: Contact your booking provider directly. • CASH BACK or wallet support: Reach out to us via the Contact Us page, support ticket system, or WhatsApp support."
        }
    ];

    constructor() { }

    ngOnInit(): void {
    }

}
