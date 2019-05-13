# Google Charts widget

[![](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/visualization.svg)](https://www.fiware.org/developers/catalogue/)
![](https://img.shields.io/github/license/Wirecloud/googlecharts-widget.svg)

This [WireCloud widget](http://wirecloud.readthedocs.org/en/latest/) allows you to create any chart/graph supported by
Google Charts. See https://developers.google.com/chart/interactive/docs/gallery for more info about what kind of
graphics you can obtain using this widget.

## Build

Be sure to have installed [Node.js](http://node.js) and [Bower](http://bower.io) in your system. For example, you can
install it on Ubunutu and Debian running the following commands:

```console
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install nodejs
sudo apt-get install npm
sudo npm install -g bower
```

Install other npm dependencies by running:

```console
npm install
```

For build the widget you need download grunt:

```console
sudo npm install -g grunt-cli
```

And now, you can use grunt:

```console
grunt
```

If everything goes well, you will find a wgt file in the **build** folder.

## Documentation

Documentation about how to use this widget is available on the [User Guide](src/doc/userguide.md). Anyway, you can find
general information about how to use widgets on the
[WireCloud's User Guide](https://wirecloud.readthedocs.io/en/stable/user_guide/) available on Read the Docs.

## Copyright and License

Copyright (c) 2016 Vendor Licensed under the MIT license.
