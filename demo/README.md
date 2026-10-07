# Demo pages

Pages running the real card against a fake Home Assistant, to show a device
without one.

## ReefLed: a day in a minute

`rsled_demo.html` plays a whole day of a ReefLed: the sun rises and sets, the
moon follows, the red marker of the chart moves with the time, and the
intensity and the colour of the beam follow the program.

```sh
npx vite build --config demo/vite.config.ts
python3 -m http.server --directory demo 8000
```

Then open <http://localhost:8000/rsled_demo.html> (`?model=g2` for a G2).

The page has a play / pause button, the length of the day (30 s to 5 min) and
a time slider. How it works is described at the top of `rsled_demo.ts`.

The bundle (`demo/dist/`) is not committed: build it again after a change of
the card.
