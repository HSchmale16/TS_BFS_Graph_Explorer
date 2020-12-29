/**
 * Bfs Explorer in Typescript.
 * Written by Henry J Schmale 
 * All rights reserved 2020
 * 
 * This code may be studied for educational purposes but may not be used commerically.
 */


// width = 20 + 1px border = 22
const GRID_BOX_SIZE = 34;
const MS_BETWEEN_UPDATES = 75;
var bfsController : BfsExplorerController = null;

// various css classes for the types of things on the grid
const CSS_START_POINT = 'start';
const CSS_FINISH_POINT = 'finish';
const CSS_WALL = 'wall';
const CSS_BTN_ACTIVE = 'btn_active';

const CSS_CUR_ERASE = 'cur_erase';
const CSS_CUR_DRAW = 'cur_draw';
const CSS_CUR_START = 'cur_start';
const CSS_CUR_FINISH = 'cur_finish';

const CSS_DISCOVERED = 'discovered';
const CSS_ACTIVE = 'active';
const CSS_IN_QUEUE = 'inQueue';
const CSS_PATH = 'path';


var LEFT_MOUSE_BTN_IS_DOWN = false;

enum CursorState {
    NO_EFFECT,
    DRAW_WALL,
    RESET_ATTRIBUTES,
    SET_START,
    SET_FINISH_POINT
}

enum BfsStatus {
    STARTING,
    IN_PROGRESS,
    FOUND_IT,
    FAILED,
    COMPLETE
}

type ElementPredicate = (el: HTMLLIElement) => boolean;
type ElementMarker = (el: HTMLElement) => null;
type FindNeighbors = (el: HTMLLIElement) => IterableIterator<HTMLLIElement>;

function clearClass(className : string, tagName : string) {
    for (var elem of document.querySelectorAll(`${tagName}.${className}`)) {
            elem.classList.remove(className);
    }
}

function clearInProgressClasses() {
    clearClass(CSS_ACTIVE, "li");
    clearClass(CSS_IN_QUEUE, "li");
    clearClass(CSS_DISCOVERED, "li");
    clearClass(CSS_PATH, "li");
}

function isDiscoveredPredicate(el: HTMLElement) {
    return el.classList.contains(CSS_DISCOVERED) || el.classList.contains(CSS_IN_QUEUE);
}

function isFinishPredicate(el: HTMLLIElement) {
    return el.classList.contains(CSS_FINISH_POINT);
}

function setDiscovered(el: HTMLElement) {
    el.classList.add(CSS_DISCOVERED);
}

function* findNSEWNeighbors(el: HTMLLIElement) {
    var i = parseInt(el.getAttribute('data-id-num'));
    var sz = bfsController.gridSize;

    var id = i + sz;
    if (id >= 0 && id < (sz * sz))
        yield getLiByIdNum(id)
    id = i - sz;
    if (id >= 0 && id < (sz * sz))
        yield getLiByIdNum(id)
    id = i + 1;
    if (i % sz != (sz - 1))
        yield getLiByIdNum(id)
    if (i % sz != 0)
        yield getLiByIdNum(i - 1);
}

function setAs(el: HTMLElement, className: string): boolean {
    if (el.classList.length > 0) return true;
    el.classList.add(className);
    return false;
}

function getLiByIdNum(num : number) : HTMLLIElement {
    return document.querySelector(`[data-id-num="${num}"]`);
}

function pickRandomLi(parent: HTMLUListElement): HTMLElement {
    var elems = parent.getElementsByTagName("li");
    return elems.item(Math.floor(Math.random() * elems.length));
}

function isNotWall(elem : HTMLLIElement) : boolean {
    return !elem.classList.contains(CSS_WALL);
}

function randomizeGrid(parentElement: HTMLUListElement) {
    // add some walls
    for (var i = 0; i < 70; ++i) {
        var elem = null;
        do {
            elem = pickRandomLi(parentElement);
        } while (setAs(elem, CSS_WALL));
    }
    // add a start point
    var elem = null;
    do {
        elem = pickRandomLi(parentElement);
    } while (setAs(elem, CSS_START_POINT));
    // add an end point
    do {
        elem = pickRandomLi(parentElement);
    } while (setAs(elem, CSS_FINISH_POINT));
}

class BfsSearch {
    currentNode: HTMLLIElement;
    queue: Array<HTMLLIElement>
    isGoal: ElementPredicate;
    isDiscovered: ElementPredicate;
    neighborFinder: FindNeighbors;
    status: BfsStatus;
    parents: Map<number,number> = new Map();
    searchCompleteTimeToPath : boolean = false;

    constructor(
        startElement: HTMLLIElement,
        isGoal: ElementPredicate,
        isDiscovered: ElementPredicate,
        neighborFinder: FindNeighbors
    ) {
        startElement.classList.add(CSS_ACTIVE);
        this.queue = new Array(startElement);
        this.isGoal = isGoal;
        this.isDiscovered = isDiscovered;
        this.neighborFinder = neighborFinder;
        this.status = BfsStatus.STARTING;
    }

    /**
     * @returns true if done
     */
    step(): boolean {
        console.log('QUEUE', this.queue);
        if (this.queue.length > 0 && !this.searchCompleteTimeToPath) {
            this.status = BfsStatus.IN_PROGRESS;
            if (this.currentNode != null) {
                this.currentNode.classList.remove(CSS_ACTIVE);
                this.currentNode.classList.add(CSS_DISCOVERED);
            }
            this.currentNode = this.queue.shift();
            this.currentNode.classList.remove(CSS_IN_QUEUE);
            this.currentNode.classList.add(CSS_ACTIVE);

            console.log('CURR', this.currentNode);

            if (this.isGoal(this.currentNode)) {
                this.status = BfsStatus.IN_PROGRESS;
                this.searchCompleteTimeToPath = true;
                return true;
            }
            var myIdNum = parseInt(this.currentNode.getAttribute('data-id-num'));
            for (var elem of this.neighborFinder(this.currentNode)) {
                console.log('TESTING NEIGHBOR', elem)
                if (!this.isDiscovered(elem) && isNotWall(elem)) {
                    this.parents[parseInt(elem.getAttribute('data-id-num'))] = myIdNum;
                    console.log(elem);
                    elem.classList.add(CSS_IN_QUEUE);
                    console.log(this.queue.push(elem));
                }
            }
            return false;
        } else {
            // draw the path one step at a time.
            if (this.searchCompleteTimeToPath && this.status != BfsStatus.COMPLETE) {
                var id = parseInt(this.currentNode.getAttribute('data-id-num'));
                console.log(id);
                this.currentNode.classList.add(CSS_PATH);
                this.currentNode = getLiByIdNum(this.parents[id]);
            } else {
                alert("Done")
            }

        }
        return true;
    }
}

class RunButtonManager {
    runBtn: HTMLButtonElement;
    stepBtn: HTMLButtonElement;
    resetBtn : HTMLButtonElement;
    bfsSearch: BfsSearch;
    intervalId : number = -1;

    constructor(
        runBtn: HTMLButtonElement,
        stepBtn: HTMLButtonElement,
        resetButton : HTMLButtonElement
    ) {
        this.bfsSearch = null;
        this.runBtn = runBtn;
        this.runBtn.onclick = (ev : MouseEvent) => {
            if (this.intervalId > 0) {
                this.pause();
            } else {
                // start the interval
                this.intervalId = setInterval(() => {
                    console.log(this);
                    try {
                        this.step()
                    } catch {
                        this.runBtn.click();
                    }
                }, MS_BETWEEN_UPDATES);
                this.runBtn.innerHTML = "Pause";
            }
        }

        this.stepBtn = stepBtn;
        this.stepBtn.onclick = () => this.step();

        this.resetBtn = resetButton;
        this.resetBtn.onclick = () => {
            this.pause();
            clearInProgressClasses();
            this.bfsSearch = null;
        }
    }

    pause() {
        // clear it
        this.runBtn.innerHTML = "Run";
        clearInterval(this.intervalId);
        this.intervalId = -1;
    }

    step() {
        console.log("doing a step");
        this.setupBfsSearchIfNeeded();
        this.bfsSearch.step();
    }

    setupBfsSearchIfNeeded() {
        if (this.bfsSearch == null || this.bfsSearch.status != BfsStatus.IN_PROGRESS) {
            console.log("RESET BFS");
            this.bfsSearch = new BfsSearch(
                <HTMLLIElement>document.getElementsByClassName(CSS_START_POINT)[0],
                isFinishPredicate,
                isDiscoveredPredicate,
                findNSEWNeighbors
            );
        }

    }
}

// The UI Controller thing
class BfsExplorerController {
    // The grid size input
    gridSizeInput: HTMLInputElement;

    // button to reset grid and update
    updateGridBtn: HTMLButtonElement;

    // The list element containing everything
    theGridElementParent: HTMLUListElement;
    theGrid : [HTMLLIElement];
    drawWallBtn: HTMLButtonElement;
    clearWallBtn: HTMLButtonElement;
    placeStartBtn: HTMLButtonElement;
    placeFinishBtn: HTMLButtonElement;

    // Fields
    gridSize: number;
    stateOfCursor: CursorState;
    search: BfsSearch
    runMgr: RunButtonManager;

    constructor(
        gridSizeInput: HTMLInputElement,
        updateGridBtn: HTMLButtonElement,
        theGridElements: HTMLUListElement,
        drawWallBtn: HTMLButtonElement,
        clearWallBtn: HTMLButtonElement,
        placeStartBtn: HTMLButtonElement,
        placeFinishBtn: HTMLButtonElement,
        runBtn: HTMLButtonElement,
        stepBtn: HTMLButtonElement,
        resetBtn : HTMLButtonElement
    ) {
        // Set attributes
        this.gridSizeInput = gridSizeInput;
        this.updateGridBtn = updateGridBtn;
        this.theGridElementParent = theGridElements;
        this.drawWallBtn = drawWallBtn;
        this.clearWallBtn = clearWallBtn;
        this.placeStartBtn = placeStartBtn;
        this.placeFinishBtn = placeFinishBtn;

        this.runMgr = new RunButtonManager(runBtn, stepBtn, resetBtn);

        // Set fields
        this.stateOfCursor = CursorState.NO_EFFECT;

        // Perform initialization on elements
        this.updateGridSize(this.gridSizeInput.valueAsNumber);
        this.updateGridBtn.onclick = (ev: MouseEvent) => {
            this.updateGridSize(this.gridSizeInput.valueAsNumber);
            this.runMgr.bfsSearch = null; // clear the bfs
        };

        // set up drawing buttons
        this.drawWallBtn.onclick = this.setDrawWall;
        this.clearWallBtn.onclick = this.setEraseWall;
        this.placeStartBtn.onclick = this.setStartPoint;
        this.placeFinishBtn.onclick = this.setFinishPoint;


        // Just freaking do it. I'll come back to it.
        document.getElementById("randomize").onclick = (ev: MouseEvent) => {
            this.updateGridSize(this.gridSizeInput.valueAsNumber);
            randomizeGrid(this.theGridElementParent);
        }
        randomizeGrid(this.theGridElementParent);
    }

    setDrawWall = (ev: MouseEvent) => {
        if (this.clearDrawingForActive(this.drawWallBtn)) {
            this.stateOfCursor = CursorState.DRAW_WALL;
            this.theGridElementParent.classList.add(CSS_CUR_DRAW);
        }

    }

    setEraseWall = (ev: MouseEvent) => {
        if (this.clearDrawingForActive(this.clearWallBtn)) {
            this.stateOfCursor = CursorState.RESET_ATTRIBUTES;
            this.theGridElementParent.classList.add(CSS_CUR_ERASE)
        }
    }

    setStartPoint = (ev: MouseEvent) => {
        if (this.clearDrawingForActive(this.placeStartBtn)) {
            this.stateOfCursor = CursorState.SET_START;
            this.theGridElementParent.classList.add(CSS_CUR_START);
        }
    }

    setFinishPoint = (ev: MouseEvent) => {
        if (this.clearDrawingForActive(this.placeFinishBtn)) {
            this.stateOfCursor = CursorState.SET_FINISH_POINT;
            this.theGridElementParent.classList.add(CSS_CUR_FINISH);
        }
    }

    /**
     * @returns true if it was already active clearing the cursor state
     */
    clearDrawingForActive(toActive: HTMLButtonElement) {
        this.theGridElementParent.className = "";
        if (toActive.classList.contains(CSS_BTN_ACTIVE)) {
            toActive.classList.remove(CSS_BTN_ACTIVE);
            this.stateOfCursor = CursorState.NO_EFFECT;
            this.theGridElementParent.className = "";
            return false;
        }
        for (var btn of [this.drawWallBtn, this.clearWallBtn, this.placeStartBtn, this.placeFinishBtn]) {
            btn.className = "";
        }
        toActive.classList.add(CSS_BTN_ACTIVE);
        return true;
    }

    handleGridElementClick = (ev: MouseEvent) => {
        if (ev.type == "click" || LEFT_MOUSE_BTN_IS_DOWN) {
            switch (this.stateOfCursor) {
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

    updateGridSize(size: number) {
        this.theGridElementParent.innerHTML = "";
        this.theGridElementParent.style.columnCount = size.toString();
        this.gridSize = size;
        var elemCount = size * size;

        // update the grid to be tight still
        this.theGridElementParent.style.width = (GRID_BOX_SIZE * size).toString() + "px";


        for (var i = 0; i < elemCount; ++i) {
            var li: HTMLLIElement = document.createElement("li");
            li.setAttribute("data-id-num", i.toString());
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
    const runBtn = <HTMLButtonElement>document.getElementById("runAtFullSpeed");
    const stepBtn = <HTMLButtonElement>document.getElementById("step");
    const resetBtn = <HTMLButtonElement>document.getElementById("resetSearch")

    bfsController = new BfsExplorerController(
        gridSizeInput, updateGridBtn, theGridElements, drawWallBtn, clearWallBtn,
        placeStartBtn, placeFinishBtn, runBtn, stepBtn, resetBtn
    );

    document.addEventListener('mousedown', (ev) => {
        LEFT_MOUSE_BTN_IS_DOWN = true;
    });

    document.addEventListener('mouseup', (ev) => {
        LEFT_MOUSE_BTN_IS_DOWN = false;
    })
}
