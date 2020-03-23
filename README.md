<a href="https://shakerite.com">![The Shakerite](shakerite.png)</a>

The official app for the Shakerite, the award-winning Shaker Heights
High School student news organization! This app is built using
[Capacitor], [Ionic], and [Vue.js 2] via [Ionic-Vue]. Specifically, this
app interacts with our [SNO Sites] website and uses the [WordPress API]
to fetch content.

[Capacitor]: https://capacitor.ionicframework.com/
[Ionic]: https://ionicframework.com/
[Vue.js 2]: https://vuejs.org/
[Ionic-Vue]: https://github.com/ModusCreateOrg/ionic-vue
[SNO Sites]: https://snosites.com/
[WordPress API]: https://developer.wordpress.org/rest-api/

- [Setting up the website](#setting-up-the-website)
- [Developing](#developing)
    - [Installing](#installing)
    - [Prerequisites](#prerequisites)
    - [iOS build](#ios-build)
    - [Android build](#android-build)
- [License](#license)

# Setting up the website

This app uses both standard WordPress features, and the proprietary
features introduced by [SNO][SNO Sites]. You'll need to install a few
plugins:

- [WP REST API Cache Remover] (Click "Clone or download" and upload it
    manually): removes 2 day cache on the API
- [WP REST Filter]\: allows searching posts by SNO author
- [REST API Enabler]\: allows getting SNO-specific data, such as authors
    and subtitles

Now, configure [REST API Enabler] by going to its page in Settings.
Under "Post Types", make sure that "Media", "Pages", "Stories", and
"Staff Profiles" are checked. They should all have their default name in
the textbox (`media`, `pages`, `posts`, `staff-profile`). Now, switch to
"Post Meta", and check `jobtitle`, `name`, `schoolyear`, `sno_deck`,
`staffposition`, and `writer`.

[WP REST API Cache Remover]: https://github.com/lights0123/wp-rest-api-cache
[WP REST Filter]: https://wordpress.org/plugins/wp-rest-filter/
[REST API Enabler]: https://wordpress.org/plugins/rest-api-enabler/

# Developing

## Prerequisites

Node 8.x+ is required for development.

## Installing

After cloning, run

```bash
yarn
```

## iOS build

Make sure you have `cocoapods` on your Mac OS. You can install
`cocoapods` with `gem`

```bash
sudo gem install cocoapods
```

You can create an iOS-specific build by executing:

```bash
yarn run build:ios
```

To deploy, `cd` to `ios/app` and run `sudo bundle install`. Then, run
`bundle exec fastlane release`.

## Android build

You will need [Android SDK](https://developer.android.com/studio/).

After the SDK is setup you can create an Android-specific build by
executing:

```bash
yarn run build:android
```

# License

This project is [licensed under the MPL 2.0](./LICENSE).
