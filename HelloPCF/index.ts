import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class HelloPCF
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  // The PCF context object\
  private _context: ComponentFramework.Context<IInputs>;
  // The wrapper div element for the component\
  private _container: HTMLDivElement;
  // The callback function to call whenever your code has made a change to a bound or output property\
  private _notifyOutputChanged: () => void;
  // Flag to track if the component is in edit mode or not\
  private _isEditMode: boolean;
  // Tracking variable for the name property\
  private _name: string | null;

  /**
   * Empty constructor.
   */

  constructor() {}

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ) {
    // Track all the things

    this._context = context;

    this._notifyOutputChanged = notifyOutputChanged;

    this._container = container;

    this._isEditMode = false;

    const message = document.createElement("span");
    message.innerText = `Hello ${
      this._isEditMode ? "" : context.parameters.name.raw
    }`;
    // Create the textbox to edit the name

    const textbox = document.createElement("input");
    textbox.type = "text";
    textbox.style.display = this._isEditMode ? "block" : "none";

    if (context.parameters.name.raw) {
      textbox.value = context.parameters.name.raw;

      // Wrap the two above elements in a div to box out the content

      const messageContainer = document.createElement("div");

      messageContainer.appendChild(message);

      messageContainer.appendChild(textbox);
      // Create the button element to switch between edit and read modes

      const button = document.createElement("button");

      button.textContent = this._isEditMode ? "Save" : "Edit";

      button.addEventListener("click", () => {
        this.buttonClick();
      });

      // Add the message container and button to the overall control container

      this._container.appendChild(messageContainer);

      this._container.appendChild(button);
    }
  }
  public buttonClick() {
    // Get our controls via DOM queries

    const textbox = this._container.querySelector("input")!;

    const message = this._container.querySelector("span")!;

    const button = this._container.querySelector("button")!;

    // If not in edit mode, copy the current name value to the textbox

    if (!this._isEditMode) {
      textbox.value = this._name ?? "";
    } else if (textbox.value != this._name) {
      // if in edit mode, copy the textbox value to _name and call the notify callback

      this._name = textbox.value;

      this._notifyOutputChanged();

      // Set up the new output based on changes

      message.innerText = `Hello ${this._isEditMode ? "" : this._name}`;

      textbox.style.display = this._isEditMode ? "inline" : "none";

      textbox.value = this._name ?? "";

      button.textContent = this._isEditMode ? "Save" : "Edit";
    }

    // flip the mode flag
    this._isEditMode = !this._isEditMode;
  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {

    // Checks for updates coming in from outside
    
    this._name = context.parameters.name.raw;
    const message = this._container.querySelector("span")!;
    message.innerText = `Hello ${this._name}`;
    }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
   */
  public getOutputs(): IOutputs {
    return {
    // If our name variable is null, return undefined instead
    name: this._name ?? undefined
    };
    }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy() {
    // Remove the event listener we created in init
    this._container.querySelector("button")!.removeEventListener("click", this.buttonClick);
    }
}
