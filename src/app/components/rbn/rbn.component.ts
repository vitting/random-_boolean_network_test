import { Component, OnInit } from "@angular/core";
import { RbnNode } from "src/app/models/rbnNode";
import Konva from "konva";
import { NgZone } from "@angular/core";

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
  layer = new Konva.Layer();
  circleTemp = new Konva.Circle();

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    this.generateTruthTable(this.numberOfConnectionNodes);
  }

  justTest(): void {
    console.log(this.numberOfNodes);
    console.log(this.numberOfConnectionNodes);
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

  runCalculations(): void {
    this.nodes = [];
    this.resultNodes = [];
    this.initMainNodes(this.numberOfNodes);
    this.initAssignConnectionNodes();
    const stage = this.initDisplayNodeValues();

    // this.ngZone.runOutsideAngular(() => this.runApplication(stage));
    this.runApplication(stage);
  }

  runApplication(stage: Konva.Stage): void {
    this.setConnectionNodePattern();
    this.setMainNodesValuesFromConnectionNodes();

    const arr: string[] = [];
    for (const node of this.nodes) {
      arr.push(node.value.toString());
    }

    this.resultNodes.push(arr);
    this.displayNodeValues();

    this.animationId = requestAnimationFrame(
      this.runApplication.bind(this, stage)
    );
  }

  cancelAnimation(): void {
    cancelAnimationFrame(this.animationId);
    console.log(this.layer.find("Circle"));

  }

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

  private initDisplayNodeValues(): Konva.Stage {
    const width =
      this.orientation === "h"
        ? this.numberOfNodes * this.drawSize
        : window.innerWidth;
    const height =
      this.orientation === "h"
        ? window.innerHeight - 200
        : this.numberOfNodes * this.drawSize;

    const stage = new Konva.Stage({
      container: ".container",
      width,
      height,
    });

    this.circleTemp = new Konva.Circle({
      radius: this.drawSize / 2,
    });
    this.circleTemp.cache();
    this.circleTemp.listening(false);
    this.layer.destroy();
    this.layer = new Konva.Layer();
    this.layer.listening(false);
    stage.add(this.layer);

    return stage;
  }

  displayNodeValues(): void {
    const currentNodeArr = this.resultNodes[this.resultNodes.length - 1];
    let y = (this.resultNodes.length * this.drawSize) + (this.drawSize / 2);

    let x = this.drawSize / 2;

    for (const item of currentNodeArr) {
      const circle = this.circleTemp.clone({
        x: this.orientation === "h" ? x : y,
        y: this.orientation === "h" ? y : x,
        fill: item === "0" ? "#0000FF" : "#FFFF00",
      });

      this.layer.add(circle);
      circle.draw();
      x += this.drawSize;
    }
    y += this.drawSize;
  }
}
