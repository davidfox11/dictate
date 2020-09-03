# Dictate

Below are the instructions for running this project locally.
Before you begin, make sure you have [homebrew](https://brew.sh/) installed.

1. Clone the repository

```bash
git clone https://github.com/davidfox11/dictate.git
```

2. Install global dependencies

```bash
brew install sox npm npx
```

3. Install client & server dependencies

```bash
cd client
npm install
cd ../speech-to-text
npm install
```

3. Set your API credentials

```bash
GOOGLE_APPLICATION_CREDENTIALS=dictate-287108-263ff098bd87.json
```

4. Start your Node Server

```bash
npm start
```

5. Start your React App

```bash
cd ../client
npm start
```

Enjoy!
