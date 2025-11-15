# GazaPay Voice Assistant

A production-ready, mobile-first voice banking assistant with WhatsApp-style hold-to-talk interface. Built with Next.js, Tailwind CSS, Framer Motion, and OpenAI speech APIs.

![GazaPay Banner](https://img.shields.io/badge/Voice-Banking-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![OpenAI](https://img.shields.io/badge/OpenAI-Powered-green?style=for-the-badge&logo=openai)

## ✨ Features

- 🎤 **WhatsApp-style Hold-to-Talk** - Press and hold to record, release to send
- 🔄 **Slide to Cancel** - Slide up while holding to cancel recording
- 🗣️ **Arabic Language Support** - Full support for Hassaniya/Arabic banking commands
- 🎯 **Intent Recognition** - Transfer, withdraw, recharge, balance check
- 🔊 **Text-to-Speech** - Natural voice responses in Arabic
- 📱 **Mobile-First Design** - Optimized for iOS and Android browsers
- 🎨 **Beautiful UI** - Gradient background, glass morphism, smooth animations
- 🔒 **Secure** - API keys stored server-side only

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Local Development

1. **Clone or download this repository**

```bash
cd gazapay-voice-assistant
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### Mobile Testing

To test on mobile devices:

1. Find your local IP address:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`

2. Make sure your mobile device is on the same network

3. Open `http://YOUR-IP:3000` on your mobile browser

4. Grant microphone permissions when prompted

## 📦 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/gazapay-voice-assistant)

### Manual Deployment

1. **Install Vercel CLI (optional)**

```bash
npm i -g vercel
```

2. **Push your code to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/gazapay-voice-assistant.git
git push -u origin main
```

3. **Deploy via Vercel Dashboard**

- Go to [vercel.com](https://vercel.com)
- Click "Add New Project"
- Import your GitHub repository
- Add environment variable: `OPENAI_API_KEY`
- Click "Deploy"

4. **Set Environment Variable**

In Vercel Dashboard → Your Project → Settings → Environment Variables:

- **Key**: `OPENAI_API_KEY`
- **Value**: `sk-...` (your OpenAI API key)
- **Environment**: Production, Preview, Development

5. **Redeploy**

After adding the environment variable, trigger a new deployment.

## 🎯 Usage

### Voice Commands (Arabic)

The assistant understands these banking operations:

#### 1. **Balance Inquiry**
- "رصيدي" (my balance)
- "كم عندي" (how much do I have)
- "شنه رصيدي" (what's my balance)

#### 2. **Money Transfer**
- "حول مئة أوقية إلى 12345678" (transfer 100 to 12345678)
- "ارسل خمسين لرقم 87654321" (send 50 to number 87654321)

#### 3. **Cash Withdrawal**
- "اسحب مئتين أوقية" (withdraw 200)
- "نبغ نسحب خمسين" (I want to withdraw 50)

#### 4. **Internet Recharge**
- "عبي الإنترنت بخمسين" (recharge internet with 50)
- "زيني بمئة" (recharge with 100)

### Confirmation
- Confirm: "نعم" / "yes" / "موافق"
- Cancel: "لا" / "no" / "إلغاء"

## 🏗️ Architecture

```
gazapay-voice-assistant/
├── app/
│   ├── api/
│   │   ├── transcribe/route.ts    # Speech-to-Text (Whisper)
│   │   ├── dialogue/route.ts      # Intent detection & dialogue
│   │   └── tts/route.ts           # Text-to-Speech
│   ├── page.tsx                   # Main app component
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── components/
│   ├── TopBar.tsx                 # Header with logo
│   ├── GlassCard.tsx              # Status display
│   ├── MicButton.tsx              # Hold-to-talk button
│   └── AIResponse.tsx             # Response display
├── lib/
│   ├── voiceEngine.ts             # Voice flow orchestration
│   ├── dialogueManager.js         # Intent & entity extraction
│   └── sessionManager.ts          # Session state management
└── package.json
```

## 🔧 Configuration

### Tailwind Colors

Customize the gradient in `tailwind.config.js`:

```js
colors: {
  'rose': { 700: '#be123c' },
  'purple': { 800: '#6b21a8' },
  'fuchsia': { 900: '#701a75' },
}
```

### TTS Voice

Change the voice in `lib/voiceEngine.ts`:

```ts
voice: 'alloy' // Options: alloy, echo, fable, onyx, nova, shimmer
```

### Mock Balance

Update demo balance in `lib/dialogueManager.js`:

```js
this.MOCK_BALANCE = 5000; // Change to any amount
```

## 🔒 Security & Privacy

### API Key Protection
- ✅ API keys stored in environment variables
- ✅ Never exposed to client-side code
- ✅ All OpenAI calls made server-side

### Data Privacy
- Audio is sent to OpenAI for processing
- No audio is stored on our servers
- Session state stored temporarily in memory
- Clear disclosure to users in UI

### Best Practices
- Use HTTPS in production (Vercel provides automatically)
- Implement rate limiting for production (placeholder in code)
- Add authentication for real banking operations
- Require OTP/PIN for transaction confirmations

## ⚠️ Important Notes

### For Production Use

This is a **prototype/demo** application. Before using with real banking:

1. **Add Authentication** - Implement proper user authentication
2. **Add Authorization** - Verify user permissions
3. **Add OTP/PIN** - Require 2FA for transactions
4. **Add Rate Limiting** - Prevent abuse
5. **Add Logging** - Monitor all transactions
6. **Add Error Recovery** - Handle edge cases
7. **Add Testing** - Comprehensive unit and integration tests
8. **Review Security** - Professional security audit

### OpenAI Limitations

- Whisper can mis-transcribe noisy audio
- TTS may not perfectly pronounce all Arabic dialects
- API costs apply based on usage
- Consider implementing caching for common responses

## 🐛 Troubleshooting

### Microphone Not Working

1. Check browser permissions: Settings → Privacy → Microphone
2. Ensure HTTPS (required for mic access on mobile)
3. Try a different browser (Chrome/Safari recommended)

### "API Key Not Configured" Error

1. Check `.env.local` file exists
2. Verify `OPENAI_API_KEY` is set correctly
3. Restart the dev server: `npm run dev`
4. On Vercel: Check Environment Variables in dashboard

### Audio Not Playing

1. Check device volume
2. Check browser autoplay settings
3. Interact with page first (click/tap) before first voice command

### "Could Not Connect" Error

1. Check internet connection
2. Verify OpenAI API key is valid
3. Check OpenAI API status: [status.openai.com](https://status.openai.com)

## 📱 Browser Compatibility

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome  | ✅      | ✅     |
| Safari  | ✅      | ✅     |
| Firefox | ✅      | ⚠️     |
| Edge    | ✅      | ✅     |

⚠️ Firefox mobile may have limited MediaRecorder support

## 🤝 Contributing

Contributions welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) - Whisper & TTS APIs
- [Next.js](https://nextjs.org) - React framework
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Lucide Icons](https://lucide.dev) - Icons

## 📞 Support

For issues or questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/yourusername/gazapay-voice-assistant/issues)
3. Open a new issue if needed

## 🗺️ Roadmap

- [ ] Add multi-language support (French, English)
- [ ] Implement real-time streaming (OpenAI Realtime API)
- [ ] Add transaction history view
- [ ] Add biometric authentication
- [ ] Add receipt generation
- [ ] Add dark/light theme toggle
- [ ] Add accessibility improvements (screen reader support)

---

Made with ❤️ for financial inclusion

