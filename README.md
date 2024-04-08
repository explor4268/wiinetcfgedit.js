# [WIP] Wii Network Configuration Editor in JavaScript

**Status**: Implemented complete mappings and read/write implementation of the WiiNetCfg class. **(No GUI editing yet, but you can edit it using the developer console, see below)**


# TODO
- [X] actual code
- [X] mappings from properties to byte offsets
- [X] **WiiNetCfg class**
- [ ] fix some bugs and clean up some codes (work in progress)
- [ ] Editing with the GUI (work in progress)
- [ ] Implement Wi-Fi and Proxy options (work in progress)
- [ ] Implement String (and string length), flags, integer, and IP Adresses inputs. (work in progress)
- [ ] Split the CSS from index.html into style.css
- [ ] Dark mode (with CSS)
- [ ] Better UI/UX (maybe with the Wii Internet Settings style)
- [ ] hex editing (advanced)


# Editing with the developer console
Proper GUI is not implemented yet. In the meanwhile, you can edit with the developer console.
- Click the `Create new...` button, or click the `Browse...` button to load the config.dat file.
- Open the developer console by pressing the `F12` key, or right-clicking then click `Inspect Element`.
- Start editing by using the `cfgclass.setValue(path,[value1,...])` or `cfgclass.getValue(path)` function. The path are seperated by underscores (`_`). (The mapping is already printed on page load, or by looking the `master_mapping` variable.)
- To save changes to your computer, click the `Download config.dat` button at the bottom of the page.


# Credits

- [https://wiibrew.org/wiki//shared2/sys/net/02/config.dat](https://wiibrew.org/wiki//shared2/sys/net/02/config.dat) for documentation.
- The [https://github.com/Bazmoc/Wii-Network-Config-Editor](https://github.com/Bazmoc/Wii-Network-Config-Editor) homebrew app for the inspiration.

---

"Nintendo Wii" is a trademark of Nintendo. This is an unofficial tool not affiliated by Nintendo in any way.
