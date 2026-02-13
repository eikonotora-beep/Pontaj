
# Pontaj Calendar

A cross-platform calendar application for tracking work hours and shifts (mobile and desktop).

## Features

- 📅 **Interactive Calendar**: Browse months and select days to enter shift information
- ⏰ **Multiple Shift Types**:
  - Day shift (06:45 - 19:15)
  - Night shift (18:45 - 07:15)
  - Custom shifts (neither and CS)
- 🇷🇴 **Romanian Holidays**: Automatically highlights legal holidays in red
- 📊 **Monthly Summary**:
  - FTL (Full-time days): Count of 8-hour weekday shifts
  - OL (Total hours): All inputted hours summed
  - Weekend hours: Hours worked on weekends
  - Working days count
- ⏱️ **Automatic Rounding**: All calculations rounded to nearest minute
- 💾 **Local Storage**: All data saved locally (no server required)
- 📱 **Responsive Design**: Works on mobile and desktop
- 🖥️ **Cross-Platform**:
  - Web browser
  - Desktop (Electron)
  - Mobile (Capacitor - iOS/Android)

## Project Structure

```
src/
├── components/
│   ├── Calendar.tsx        # Main calendar component
│   ├── ShiftInput.tsx      # Shift input form
│   └── DayEntryForm.tsx    # Day entry modal
├── utils/
│   ├── dateUtils.ts        # Date calculations and holiday logic
│   └── storage.ts          # LocalStorage management
├── types/
│   └── index.ts            # TypeScript types
├── styles/
│   ├── App.css
│   ├── Calendar.css
│   ├── ShiftInput.css
│   └── DayEntryForm.css
├── App.tsx                 # Main app component
└── index.tsx               # Entry point

public/
├── index.html              # HTML template
├── electron.js             # Electron main process
└── preload.js              # Electron preload script
```

## Installation

```bash
# Install dependencies
npm install
```

## Development

### Web/React Development
```bash
npm start
```
Opens at http://localhost:3000

### Desktop (Electron)
```bash
npm run electron
```
Starts React dev server and Electron together

### Mobile (Capacitor)

#### iOS
```bash
npm run build:web
npm run sync-mobile
npm run mobile
```

#### Android
```bash
npm run build:web
npm run sync-mobile
npm run mobile-android
```

## Building

### Web Build
```bash
npm run build
```

### Desktop Build (Electron)
```bash
npm run electron-build
```

### Mobile Build
```bash
npm run build:web
# Then open Xcode or Android Studio to build
npm run mobile
```

## Usage

1. **Select a Date**: Click on any day in the calendar
2. **Add Shifts**: Click the shift buttons to add Day, Night, Neither, or CS shifts
3. **Set Times**: Enter start and end times for each shift
4. **View Summary**: Check the monthly totals at the bottom of the calendar
5. **Holidays**: Red highlighted days are Romanian legal holidays

## Technologies

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Electron**: Desktop app
- **Capacitor**: Mobile app bridge
- **CSS3**: Responsive styling
- **LocalStorage**: Data persistence

## Romanian Holidays Included

- New Year's Day (1-2 January)
- Unification Day (24 January)
- International Women's Day (8-9 March)
- Labour Day (1 May)
- National Day (1 December)
- Christmas (25-26 December)

## License

MIT

## Support

For issues or feature requests, please contact the development team.
>>>>>>> 35b6295 (Initial commit for iOS cloud build)
