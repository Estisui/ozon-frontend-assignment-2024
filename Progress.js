class Progress extends HTMLElement {
  static css = `
    * {
      box-sizing: border-box;
    }

    :host {
      --color-accent: #005bff;
      --color-secondary: #e0e6ef;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 60px;
      max-width: 568px;
      max-height: 320px;
      padding: 110px 50px;
    }

    @media (max-width: 500px) {
      :host {
        flex-direction: column;
      }
    }

    .header {
      position: absolute;
      left: 0;
      top: 0;
    }

    .progressBar {
      --size: 120px;
      --bar-width: 20px;
      
      width: var(--size);
      aspect-ratio: 1 / 1;

      background: conic-gradient(
        var(--color-accent) var(--progress),
        var(--color-secondary) 0%
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
      justify-content: space-between;
      gap: 20px;
      flex-direction: column;
    }

    .label {
      display: flex;
      gap: 20px;
    }

    .input {
      font-family: inherit; 
      color: inherit;
      border-radius: 15px;
    }

    .input[type="number"]::-webkit-outer-spin-button,
    .input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    .input[type="number"] {
      -moz-appearance: textfield;
    }

    .input__value {
      width: 50px;
      border: solid black 1px;
      text-align: center;
      font-size: 1rem;
    }

    .input[type="checkbox"] {
      position: relative;
      
      width: 50px;
      height: 30px;
      margin: 0;
    
      vertical-align: top;
    
      background: var(--color-secondary);
      border-radius: 30px;
      outline: none;
      cursor: pointer;
    
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
        
      transition: all 0.3s cubic-bezier(0.2, 0.85, 0.32, 1.2);
    }
    
    input[type="checkbox"]::after {
      content: "";
      
      position: absolute;
      left: 3px;
      top: 2px;
      
      width: 26px;
      height: 26px;
      background-color: white;
      border-radius: 50%;
      
      transform: translateX(0);
      
      transition: all 0.3s cubic-bezier(0.2, 0.85, 0.32, 1.2);
    }
    
    .input[type="checkbox"]:checked::after {
      transform: translateX(calc(100% - 7px));
      background-color: #fff;  
    }
    
    .input[type="checkbox"]:checked {
      background-color: var(--color-accent);
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
    const valueLabel = document.createElement("label");
    valueLabel.classList.add('label');
    const valueSpan = document.createElement("span");
    valueSpan.textContent = "Value";
    this.valueInput = document.createElement("input");
    this.valueInput.classList.add("input", "input__value");
    this.valueInput.type = "number";
    valueLabel.append(this.valueInput, valueSpan);

    const animateLabel = document.createElement("label");
    animateLabel.classList.add('label');
    const animateSpan = document.createElement("span");
    animateSpan.textContent = "Animate";
    this.animateInput = document.createElement("input");
    this.animateInput.classList.add("input");
    this.animateInput.type = "checkbox";
    animateLabel.append(this.animateInput, animateSpan);

    const hideLabel = document.createElement("label");
    hideLabel.classList.add('label');
    const hideSpan = document.createElement("span");
    hideSpan.textContent = "Hide";
    this.hideInput = document.createElement("input");
    this.hideInput.classList.add("input");
    this.hideInput.type = "checkbox";
    hideLabel.append(this.hideInput, hideSpan);

    settings.append(valueLabel, animateLabel, hideLabel);

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
