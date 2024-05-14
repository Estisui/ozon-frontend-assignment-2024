class Progress extends HTMLElement {
  static css = `
    * {
      box-sizing: border-box;
    }

    :host {
      position: relative;
      display: flex;
      justify-content: center;
      gap: 50px;
      max-width: 568px;
      max-height: 320px;
      padding: 110px;
    }

    .header {
      position: absolute;
      left: 0;
      top: 0;
    }

    .progressBar {
      --size: 100px;
      --bar-width: 15px;
      
      width: var(--size);
      aspect-ratio: 1 / 1;

      background: conic-gradient(
        #005bff var(--progress, 0),
        #e0e6ef 0%
      );
      border-radius: 50%;

      display: flex;
      justify-content: center;
      align-items: center;

      &::after {
        content: '';
        background: white;
        border-radius: inherit;
        width: calc(100% - var(--bar-width));
        aspect-ratio: 1 / 1;

        display: grid;
      }
    }

    .settings {
      display: flex;
      flex-direction: column;
    }
  `;

  static get observedAttributes() {
    return ["value", "state"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    const style = document.createElement("style");

    const p = document.createElement("p");
    const progress = document.createElement("div");
    const settings = document.createElement("div");
    settings.classList.add("settings");

    p.textContent = "Progress";
    p.classList.add("header");

    // Progress part

    this.progressBar = document.createElement("div");
    this.progressBar.classList.add("progressBar");
    this.progressBar.setAttribute("role", "progressbar");
    progress.append(this.progressBar);

    // Settings part

    this.valueInput = document.createElement("input");
    this.valueInput.classList.add("input__value");
    this.valueInput.type = "number";
    this.animateInput = document.createElement("input");
    this.animateInput.type = "checkbox";
    this.hideInput = document.createElement("input");
    this.hideInput.type = "checkbox";
    settings.append(this.valueInput, this.animateInput, this.hideInput);

    // Combining alltogether

    style.innerHTML = Progress.css;
    this.shadowRoot.append(style, p, progress, settings);

    // adding listeners

    this.valueInput.addEventListener("change", () => {
      this.value = this.valueInput.value;
    });

    this.animateInput.addEventListener("change", () => {
      this.animateInput.checked
        ? (this.state = "animated")
        : (this.state = "normal");
    });

    this.hideInput.addEventListener("change", () => {
      this.hideInput.checked
        ? (this.state = "hidden")
        : (this.state = "normal");
    });
  }

  get state() {
    return this.getAttribute("state");
  }

  set state(value) {
    this.setAttribute("state", value);
  }

  get value() {
    const value = this.getAttribute("value");

    if (isNaN(value)) {
      return 0;
    }

    if (value < 0) {
      return 0;
    } else if (value > 100) {
      return 100;
    }

    return Number(value);
  }

  set value(value) {
    this.setAttribute("value", value);
  }

  // all logic here:

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(name, oldValue, newValue);
    switch (name) {
      case "value":
        this.progressBar.style.setProperty("--progress", this.value + "%");
        this.valueInput.value = this.value;
        break;
      case "state":
        switch (oldValue) {
          case "animated":
            clearInterval(this.timerId);
            this.timerId = null;
            this.animateInput.checked = false;
            break;
          case "hidden":
            this.style.removeProperty("visibility");
            this.hideInput.checked = false;
            break;
        }
        switch (newValue) {
          case "animated":
            this.timerId = setInterval(() => {
              if (this.value < 100) {
                this.value += 1;
              } else {
                this.state = "normal";
              }
            }, 100);
            break;
          case "hidden":
            this.style.setProperty("visibility", "hidden");
            break;
        }
    }
  }
}

customElements.define("progress-circular", Progress);
