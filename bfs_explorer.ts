/**
 * Bfs Explorer in Typescript.
 * Written by Henry J Schmale 
 * All rights reserved 2020
 * 
 * This code may be studied for educational purposes but may not be used commerically.
 */


// width = 20 + 1px border = 22
const GRID_BOX_SIZE = 32;

// various css classes for the types of things on the grid
const CSS_START_POINT = 'start';
const CSS_FINISH_POINT = 'finish';
const CSS_WALL = 'wall';
const CSS_BTN_ACTIVE = 'btn_active';

enum CursorState {
    NO_EFFECT,
    CREATE_WALL,
    ERASE,
    SET_START,
    SET_FINISH_POINT
}

function setButtonActiveClosure(setToCursor : CursorState, bfs : BfsExplorer) {
    return (ev : MouseEvent) => {
        bfs.stateOfCursor = setToCursor;
    }
}

class BfsExplorer {
    // The grid size input
    gridSizeInput : HTMLInputElement;

    // button to reset grid and update
    updateGridBtn : HTMLButtonElement;

    // The list element containing everything
    theGridElementParent : HTMLUListElement;
    theGrid = [HTMLLIElement];
    drawWallBtn : HTMLButtonElement;
    clearWallBtn : HTMLButtonElement;
    placeStartBtn : HTMLButtonElement;
    placeFinishBtn : HTMLButtonElement;
    gridSize : number;

    stateOfCursor : CursorState;

    constructor(
        gridSizeInput : HTMLInputElement,
        updateGridBtn : HTMLButtonElement,
        theGridElements : HTMLUListElement,
        drawWallBtn : HTMLButtonElement,
        clearWallBtn : HTMLButtonElement,
        placeStartBtn : HTMLButtonElement,
        placeFinishBtn : HTMLButtonElement
    ) {
        // Set attributes
        this.gridSizeInput = gridSizeInput;
        this.updateGridBtn = updateGridBtn;
        this.theGridElementParent = theGridElements;
        this.drawWallBtn = drawWallBtn;
        this.clearWallBtn = clearWallBtn;
        this.placeStartBtn = placeStartBtn,
        this.placeFinishBtn = placeFinishBtn;

        // Set fields
        this.stateOfCursor = CursorState.NO_EFFECT;

        // Perform initialization on elements
        this.updateGridSize(this.gridSizeInput.valueAsNumber);
        this.updateGridBtn.addEventListener('click', (ev : MouseEvent) => {
            this.updateGridSize(this.gridSizeInput.valueAsNumber);
        });
    }

    handleGridElementClick(ev : MouseEvent) {
        console.log(ev);
    }

    updateGridSize(size : number) {
        this.theGridElementParent.innerHTML = "";
        this.theGridElementParent.style.columnCount = size.toString();
        this.gridSize = size;
        var elemCount = size * size;

        // update the grid to be tight still
        this.theGridElementParent.style.width = (GRID_BOX_SIZE * size).toString() + "px";


        for (var i = 0; i < elemCount; ++i) {
            var li : HTMLLIElement = document.createElement("li");
            li.addEventListener('click', this.handleGridElementClick);
            this.theGridElementParent.appendChild(li);
        }
    }
}

window.onload = () => {
    const gridSizeInput = <HTMLInputElement>document.getElementById("gridSizeInput");
    const updateGridBtn = <HTMLButtonElement>document.getElementById("updateGridBtn");
    const theGridElements = <HTMLUListElement>document.getElementById("theGridElements");
    const drawWallBtn = <HTMLButtonElement>document.getElementById("drawWallBtn");
    const clearWallBtn = <HTMLButtonElement>document.getElementById("clearWallBtn");
    const placeStartBtn = <HTMLButtonElement>document.getElementById("placeStartBtn");
    const placeFinishBtn = <HTMLButtonElement>document.getElementById("placeFinishBtn")

    const bfs = new BfsExplorer(
        gridSizeInput, updateGridBtn, theGridElements, drawWallBtn, clearWallBtn,
        placeStartBtn, placeFinishBtn
    );
}