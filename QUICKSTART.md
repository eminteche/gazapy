# Quick Start Guide - GazaPay Voice Assistant

Get up and running in 5 minutes! 🚀

## Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages:
- Next.js 14
- React 18
- Framer Motion
- Tailwind CSS
- Lucide Icons
- OpenAI SDK dependencies

## Step 2: Set Up Environment Variables

Create a file named `.env.local` in the root directory with this content:

```env
# OpenAI API Key
# Get yours at: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**How to get an OpenAI API key:**
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Paste it in your `.env.local` file

**⚠️ Important:** Never commit `.env.local` to Git!

## Step 3: Run Development Server

```bash
npm run dev
```

The app will start at [http://localhost:3000](http://localhost:3000)

## Step 4: Test It Out

### Desktop Testing

1. Open [http://localhost:3000](http://localhost:3000) in Chrome or Safari
2. Grant microphone permissions when prompted
3. Click and hold the microphone button
4. Say: "رصيدي" (my balance)
5. Release the button
6. Wait for the response!

### Mobile Testing

1. Find your computer's local IP:
   - **Windows:** Open PowerShell, type `ipconfig`, look for IPv4 Address
   - **Mac:** Open Terminal, type `ifconfig`, look for inet under en0
   - **Linux:** Type `ip addr show`, look for inet

2. Make sure your phone is on the same WiFi network

3. On your phone, open browser and go to: `http://YOUR-IP:3000`
   - Example: `http://192.168.1.100:3000`

4. Grant microphone permissions

5. Test hold-to-talk gesture!

## Voice Commands to Try

### Arabic Commands

**Check Balance:**
- "رصيدي" (my balance)
- "كم عندي" (how much do I have)

**Transfer Money:**
- "حول مئة أوقية إلى 12345678"
- "ارسل خمسين لرقم 87654321"

**Withdraw Cash:**
- "اسحب مئتين"
- "نبغ نسحب خمسين"

**Recharge Internet:**
- "عبي الإنترنت بخمسين"
- "زيني بمئة"

**Confirm Actions:**
- "نعم" (yes)
- "لا" (no)

## Troubleshooting

### "API Key Not Configured"

**Problem:** OpenAI API key is missing or invalid

**Solution:**
1. Check that `.env.local` exists in root directory
2. Verify the key starts with `sk-`
3. Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### "Microphone Access Denied"

**Problem:** Browser blocked microphone access

**Solution:**
1. Click the 🔒 or ⓘ icon in the browser address bar
2. Find "Microphone" permissions
3. Set to "Allow"
4. Refresh the page

### "Module Not Found" Errors

**Problem:** Dependencies not installed correctly

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Nothing Happens When I Hold the Button

**Problem:** Event listeners not working

**Solution:**
1. Check browser console for errors (F12)
2. Try a different browser (Chrome recommended)
3. On mobile, make sure you're using touch (not mouse emulation)

## What's Next?

### Deploy to Vercel

Ready to deploy? Follow the [DEPLOYMENT.md](./DEPLOYMENT.md) guide.

### Customize the UI

Edit these files:
- `app/page.tsx` - Main app component
- `app/globals.css` - Global styles
- `tailwind.config.js` - Colors and theme

### Modify Voice Responses

Edit `lib/dialogueManager.js`:
- Add new intents
- Change response templates
- Adjust entity extraction

### Change TTS Voice

Edit `lib/voiceEngine.ts`, line ~71:
```typescript
voice: 'alloy' // Try: echo, fable, onyx, nova, shimmer
```

## Project Structure

```
gazapay-voice-assistant/
├── app/
│   ├── api/              # API routes
│   │   ├── transcribe/   # Speech-to-Text
│   │   ├── dialogue/     # Intent detection
│   │   └── tts/          # Text-to-Speech
│   ├── page.tsx          # Main UI
│   ├── layout.tsx        # App layout
│   └── globals.css       # Styles
├── components/           # React components
├── lib/                  # Core logic
│   ├── voiceEngine.ts    # Voice flow
│   ├── dialogueManager.js # Intent detection
│   └── sessionManager.ts  # Session state
└── package.json          # Dependencies
```

## Development Tips

### Hot Reload

Next.js automatically reloads when you save files. No need to restart!

### Check Console

Keep browser DevTools open (F12) to see:
- Network requests
- Console logs
- Errors

### Test API Routes Directly

Use curl or Postman:

```bash
# Test dialogue endpoint
curl -X POST http://localhost:3000/api/dialogue \
  -H "Content-Type: application/json" \
  -d '{"transcript":"رصيدي","sessionId":"test123"}'
```

### View Session State

Check what the AI remembers:
```
http://localhost:3000/api/dialogue?action=status
```

Clear session:
```
http://localhost:3000/api/dialogue?action=clear&sessionId=YOUR_SESSION_ID
```

## Performance Tips

### Speed Up Development

Add this to `next.config.js`:
```js
experimental: {
  optimizeCss: true,
}
```

### Reduce Bundle Size

The app is already optimized, but you can:
1. Use production build: `npm run build && npm start`
2. Enable compression in Vercel (automatic)
3. Lazy load heavy components

## Need Help?

1. 📖 Read the full [README.md](./README.md)
2. 🚀 Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
3. 🐛 Look at browser console for error messages
4. 💬 Check [GitHub Issues](https://github.com/yourusername/gazapay-voice-assistant/issues)

---

**Happy Coding! 🎉**

You now have a fully functional voice banking assistant running locally.

