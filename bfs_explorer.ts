/**
 * Bfs Explorer in Typescript.
 * Written by Henry J Schmale 
 * All rights reserved 2020
 * 
 * This code may be studied for educational purposes but may not be used commerically.
 */


// width = 20 + 1px border = 22
const GRID_BOX_SIZE = 34;

// various css classes for the types of things on the grid
const CSS_START_POINT = 'start';
const CSS_FINISH_POINT = 'finish';
const CSS_WALL = 'wall';
const CSS_BTN_ACTIVE = 'btn_active';

const CSS_CUR_ERASE = 'cur_erase';
const CSS_CUR_DRAW = 'cur_draw';
const CSS_CUR_START = 'cur_start';
const CSS_CUR_FINISH = 'cur_finish';

var LEFT_MOUSE_BTN_IS_DOWN = false;

enum CursorState {
    NO_EFFECT,
    DRAW_WALL,
    RESET_ATTRIBUTES,
    SET_START,
    SET_FINISH_POINT
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
        this.updateGridBtn.onclick = (ev : MouseEvent) => {
            this.updateGridSize(this.gridSizeInput.valueAsNumber);
        };
        
        // set up drawing buttons
        this.drawWallBtn.onclick = this.setDrawWall;
        this.clearWallBtn.onclick = this.setEraseWall;
        this.placeStartBtn.onclick = this.setStartPoint;
        this.placeFinishBtn.onclick = this.setFinishPoint;
    }

    setDrawWall = (ev : MouseEvent) => {
        if (this.clearDrawingForActive(this.drawWallBtn)) {
            this.stateOfCursor = CursorState.DRAW_WALL;
            this.theGridElementParent.classList.add(CSS_CUR_DRAW);
        }
        
    }

    setEraseWall = (ev : MouseEvent) => {
        if(this.clearDrawingForActive(this.clearWallBtn)) {
            this.stateOfCursor = CursorState.RESET_ATTRIBUTES;
            this.theGridElementParent.classList.add(CSS_CUR_ERASE)
        }
    }

    setStartPoint = (ev : MouseEvent) => {
        if (this.clearDrawingForActive(this.placeStartBtn) ) {
            this.stateOfCursor = CursorState.SET_START;
            this.theGridElementParent.classList.add(CSS_CUR_START);
        }
    }

    setFinishPoint = (ev : MouseEvent) => {
        if (this.clearDrawingForActive(this.placeFinishBtn)) {
            this.stateOfCursor = CursorState.SET_FINISH_POINT;
            this.theGridElementParent.classList.add(CSS_CUR_FINISH);
        }
    }

    /**
     * @returns true if it was already active clearing the cursor state
     */
    clearDrawingForActive(toActive : HTMLButtonElement) {
        this.theGridElementParent.className = "";
        if (toActive.classList.contains(CSS_BTN_ACTIVE)) {
            toActive.classList.remove(CSS_BTN_ACTIVE);
            this.stateOfCursor = CursorState.NO_EFFECT;
            this.theGridElementParent.className = "";
            return false;
        }
        for(var btn of [this.drawWallBtn, this.clearWallBtn, this.placeStartBtn, this.placeFinishBtn]) {
            btn.className = "";
        }
        toActive.classList.add(CSS_BTN_ACTIVE);
        return true;
    }

    handleGridElementClick = (ev : MouseEvent) => {
        console.log(ev, this.stateOfCursor);
        if (ev.type == "click" || LEFT_MOUSE_BTN_IS_DOWN) {
            switch(this.stateOfCursor) {
            case CursorState.DRAW_WALL:
                (<HTMLElement>ev.target).className = CSS_WALL;
                break;
            case CursorState.RESET_ATTRIBUTES:
                (<HTMLElement>ev.target).className = "";
                break;
            case CursorState.SET_START:
                var elems = document.getElementsByClassName(CSS_START_POINT);
                for (var i = 0; i < elems.length; ++i) {
                    elems.item(i).className = "";
                }
                (<HTMLElement>ev.target).className = CSS_START_POINT;
                break;
            case CursorState.SET_FINISH_POINT:
                (<HTMLElement>ev.target).className = CSS_FINISH_POINT;
                break;
            default:
            }
        }
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
            li.addEventListener('mouseenter', this.handleGridElementClick);
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

    document.addEventListener('mousedown', (ev) => {
        LEFT_MOUSE_BTN_IS_DOWN = true;
    });

    document.addEventListener('mouseup', (ev) => {
        LEFT_MOUSE_BTN_IS_DOWN = false;
    })
}