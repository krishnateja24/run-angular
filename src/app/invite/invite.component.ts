import { Component, Output, EventEmitter, OnInit } from '@angular/core';

export interface FloatingSymbol {
  symbol: string;
  left: number;
  fontSize: number;
  duration: number;
  delay: number;
}

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [],
  templateUrl: './invite.component.html',
  styleUrl: './invite.component.scss',
})
export class InviteComponent implements OnInit {
  @Output() yesClicked = new EventEmitter<void>();

  floatingSymbols: FloatingSymbol[] = [];

  yesFontSize = 1.4;
  yesPadV = 14;
  yesPadH = 42;

  noEscapeCount = 0;
  noBtnLabel = 'No 🙈';
  noBtnTop = 0;
  noBtnLeft = 0;

  private readonly noLabels = [
    'Nah 😅',
    'Nope! 🏃',
    'Catch me!',
    'Too fast! 💨',
    'Miss! 😄',
    'Still no? 🤭',
    'Zoom! 🏃‍♀️',
    'Not today!',
    'Maybe… 👟',
    'Keep trying!',
    'Give up! 😂',
  ];

  private readonly symbols = ['🏃‍♀️', '🏃', '👟', '🌸', '✨', '🌷', '💗', '🌿', '💨'];

  ngOnInit(): void {
    this.noBtnTop = window.innerHeight * 0.68;
    this.noBtnLeft = window.innerWidth * 0.55;
    for (let i = 0; i < 26; i++) {
      this.floatingSymbols.push({
        symbol: this.symbols[Math.floor(Math.random() * this.symbols.length)],
        left: Math.random() * 100,
        fontSize: 1 + Math.random() * 1.4,
        duration: 6 + Math.random() * 10,
        delay: -(Math.random() * 12),
      });
    }
  }

  onNoClick(): void {
    this.escape();
  }

  private escape(): void {
    this.noEscapeCount++;

    const margin = 20;
    const btnW = 160;
    const btnH = 50;
    this.noBtnTop = margin + Math.random() * (window.innerHeight - 2 * margin - btnH);
    this.noBtnLeft = margin + Math.random() * (window.innerWidth - 2 * margin - btnW);
    this.noBtnLabel = this.noLabels[Math.min(this.noEscapeCount, this.noLabels.length - 1)];

    this.yesFontSize = Math.min(this.yesFontSize + 0.28, 4.8);
    this.yesPadV = Math.min(this.yesPadV + 5, 55);
    this.yesPadH = Math.min(this.yesPadH + 10, 95);
  }

  onYesClick(): void {
    this.yesClicked.emit();
  }
}
