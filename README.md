# Nine After React Native Expo app 🥳

`npm install --global eas-cli`

## Build and submit app
```
eas build --platform ios --profile production --auto-submit
eas build --platform ios --profile staging --auto-submit
```

## Create Dev Build for test
```
eas build --profile development --platform ios
```

## Create Prod dev Build
```
eas build --profile production-dev --platform ios
```

## Submit latest ios build
```
eas submit -p ios --latest
```

## Update eas command
```
UPDATE EAS = npm i -g eas-cli
``` 

## Start Expo Go with env
```
NODE_ENV=development npx expo start --clear
NODE_ENV=production npx expo start --clear
```
I had to rename the devconfig to remove it. 

## Configure eas build
```
npm run with-env eas credentials
npm run with-test-env eas credentials
```

eas build --profile development --platform ios
eas build:run
npx expo start --dev-client