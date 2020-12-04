import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { RbnNode } from "src/app/models/rbnNode";

interface TruthTableDisplay {
  pattern: string;
  value: number;
}

@Component({
  selector: "app-rbn",
  templateUrl: "./rbn.component.html",
  styleUrls: ["./rbn.component.scss"],
})
export class RbnComponent implements OnInit {
  controlsActive = true;
  numberOfNodesCalculated = 0;
  numberOfNodesSelect = [20, 50, 100, 200, 400, 500, 600, 700, 800, 900, 1000];
  numberOfConnectionNodesSelect = [3, 4, 5, 6, 7, 8, 9, 10];
  orientationSelect = ["horizontal", "vertical"];
  orientationValue = "horizontal";
  dotSizeSelect = ["small", "medium", "large"];
  dotSizeValue = "medium";
  numberOfNodes = 100;
  numberOfConnectionNodes = 5;
  numberOfNodeRuns = 100;
  truthTable: Map<string, number> = new Map<string, number>();
  nodes: RbnNode[] = [];
  truthTableDisplay: TruthTableDisplay[] = [];
  showTruthTable = false;
  buttonTruthTableTitle = "Show truth table";
  resultNodes: Array<Array<string>> = [];
  drawSize = 6; // 4, 6, 10
  orientation = "h"; // h, v
  animationId = 0;
  @ViewChild("canvas", { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private startDrawingAt = 0;
  private ctx!: CanvasRenderingContext2D | null;

  constructor() {}

  ngOnInit(): void {
    this.generateTruthTable(this.numberOfConnectionNodes);
  }

  // Generate truth table
  private generateTruthTable(numberOfConnections: number): void {
    this.truthTable.clear();

    const bitPatterns = this.generateBitPattern(numberOfConnections);

    for (const pattern of bitPatterns) {
      this.truthTable.set(pattern, this.getRandomBitValue());
    }
  }

  // Generate bit pattern combinations for truth table
  private generateBitPattern(numberOfConnections: number): string[] {
    let basePattern: string[] = ["00", "01", "10", "11"];

    for (let index = 2; index < numberOfConnections; index++) {
      const newPattern: string[] = [];

      for (const item of basePattern) {
        newPattern.push(item + "0");
        newPattern.push(item + "1");
      }

      basePattern = newPattern;
    }

    return basePattern;
  }

  // Generate number of main nodes
  private initMainNodes(numberOfNodesToGenerate: number): void {
    for (let index = 0; index < numberOfNodesToGenerate; index++) {
      this.nodes.push({
        index,
        value: this.getRandomBitValue(),
        connections: [],
        connectionPattern: "",
      });
    }
  }

  // Assign node connections to  main node
  private initAssignConnectionNodes(): void {
    for (const mainNode of this.nodes) {
      mainNode.connections = this.generateConnectionNodes(mainNode);
    }
  }

  // Generate nodes for connections to  main node
  private generateConnectionNodes(mainNode: RbnNode): number[] {
    let findConnectionNodes = true;
    const connectionNodes: number[] = [];
    while (findConnectionNodes) {
      if (connectionNodes.length < this.numberOfConnectionNodes) {
        const index = this.getRandomNodeIndex(this.numberOfNodes);
        const node = this.nodes[index];
        if (node !== mainNode) {
          const result = connectionNodes.find((element) => {
            return node.index === element;
          });

          if (!result) {
            connectionNodes.push(node.index);
          }
        }
      } else {
        findConnectionNodes = false;
      }
    }

    return connectionNodes;
  }

  // Generate a random 0 / 1
  private getRandomBitValue(): number {
    return Math.round(Math.random());
  }

  // Generate a random index number from possible main nodes
  private getRandomNodeIndex(numberOfNodes: number): number {
    return Math.floor(Math.random() * numberOfNodes);
  }

  private setConnectionNodePattern(): void {
    for (const node of this.nodes) {
      node.connectionPattern = this.generateConnectionNodePattern(
        node.connections
      );
    }
  }

  private generateConnectionNodePattern(connectionNodes: number[]): string {
    let pattern = "";
    for (const connectionNode of connectionNodes) {
      const node = this.nodes[connectionNode];
      pattern += node.value.toString();
    }

    return pattern;
  }

  private setMainNodesValuesFromConnectionNodes(): void {
    for (const node of this.nodes) {
      const patternValue = this.truthTable.get(node.connectionPattern);
      node.value = patternValue === 0 ? 1 : 0;
    }
  }

  changeConnectionNodes(): void {
    this.generateTruthTable(this.numberOfConnectionNodes);
  }

  // When user changes draw orientation, change value and redraw canvas
  changeOrientation(): void {
    if (this.orientationValue === "horizontal") {
      this.orientation = "h";
    } else {
      this.orientation = "v";
    }
  }

  changeDotSize(): void {
    switch (this.dotSizeValue) {
      case "small":
        this.drawSize = 4;
        break;
      case "medium":
        this.drawSize = 6;
        break;

      case "large":
        this.drawSize = 10;
        break;
    }
  }

  private changeCanvasSize(): void {
    const width =
      this.orientation === "h"
        ? this.numberOfNodes * this.drawSize
        : window.innerWidth - 10;
    const height =
      this.orientation === "h"
        ? window.innerHeight - 200
        : this.numberOfNodes * this.drawSize;

    this.canvas.nativeElement.width = width;
    this.canvas.nativeElement.height = height;
    this.ctx = this.canvas.nativeElement.getContext("2d");
  }

  private runApplication(): void {
    this.controlsActive = false;
    this.setConnectionNodePattern();
    this.setMainNodesValuesFromConnectionNodes();

    const arr: string[] = [];

    for (const node of this.nodes) {
      arr.push(node.value.toString());
    }

    this.resultNodes.push(arr);
    this.numberOfNodesCalculated = this.resultNodes.length * this.numberOfNodes;

    this.displayNodeValues();

    this.animationId = requestAnimationFrame(this.runApplication.bind(this));
  }

  runCalculations(): void {
    this.changeCanvasSize();
    this.nodes = [];
    this.resultNodes = [];
    this.initMainNodes(this.numberOfNodes);
    this.initAssignConnectionNodes();
    this.runApplication();
  }

  // Cancel current calculation
  cancelAnimation(): void {
    cancelAnimationFrame(this.animationId);
    this.controlsActive = true;
  }

  // Print current truth table
  displayTruthTable(): void {
    this.truthTableDisplay = [];

    if (this.showTruthTable) {
      this.showTruthTable = false;
      this.buttonTruthTableTitle = "Show truth table";
    } else {
      this.showTruthTable = true;
      this.truthTable.forEach((value, pattern) => {
        this.truthTableDisplay.push({ pattern, value });
      });

      this.buttonTruthTableTitle = "Hide truth table";
    }
  }

  displayNodeValues(): void {
    let y = this.drawSize / 2;

    if (this.ctx) {
      this.ctx.clearRect(
        0,
        0,
        this.canvas.nativeElement.width,
        this.canvas.nativeElement.height
      );
    }
    for (
      let index = this.startDrawingAt;
      index < this.resultNodes.length;
      index++
    ) {
      const nodes = this.resultNodes[index];
      let x = this.drawSize / 2;
      if (y > this.canvas.nativeElement.height) {
        this.startDrawingAt = index;
      }
      for (const item of nodes) {
        if (this.ctx) {
          this.ctx.beginPath();

          this.ctx.arc(
            this.orientation === "h" ? x : y,
            this.orientation === "h" ? y : x,
            this.drawSize / 2,
            0,
            Math.PI * 2
          );
          this.ctx.fillStyle = item === "0" ? "#0000FF" : "#FFFF00";
          this.ctx.lineWidth = 0;
          this.ctx.fill();
        }

        x += this.drawSize;
      }

      y += this.drawSize;
    }

    // for (const nodes of this.resultNodes) {
    //   let x = this.drawSize / 2;

    //   if (y > this.canvas.nativeElement.height) {
    //     console.log("STØRRE", y, this.canvas.nativeElement.height);
    //   }

    //   for (const item of nodes) {
    //     if (this.ctx) {
    //       this.ctx.beginPath();

    //       this.ctx.arc(
    //         this.orientation === "h" ? x : y,
    //         this.orientation === "h" ? y : x,
    //         this.drawSize / 2,
    //         0,
    //         Math.PI * 2
    //       );
    //       this.ctx.fillStyle = item === "0" ? "#0000FF" : "#FFFF00";
    //       this.ctx.lineWidth = 0;
    //       this.ctx.fill();
    //     }

    //     x += this.drawSize;
    //   }

    //   y += this.drawSize;
    // }
  }
}
