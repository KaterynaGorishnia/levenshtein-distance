import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {FormsModule} from "@angular/forms";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'my-app';
  isAlgorithmRunning: boolean = false;
  str1: string | any[];
  str2: string | any[];
  matrixRow: any[] = [];
  operations: string[] = [];
  minOperations: number;
  currentOperationIndex: number = 1;
  counter: number = 0;
  stopRunning: boolean = false;
  historyArr: string[] | undefined;
  selectedMode: string = 'detailed';
  showNextStep: boolean = true;
  page: string = 'main'
  @Output() modeChanged = new EventEmitter<string>();

  onModeChange() {
    this.modeChanged.emit(this.selectedMode);
  }

  ngOnInit() {
    this.historyArr = this.getFromLocalStorage('arr');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const fileContent: string = reader.result as string;

        const words = fileContent.split(',');

        this.str1 = words.length >= 1 ? words[0].trim() : '';
        this.str2 = words.length >= 2 ? words[1].trim() : '';

        this.runExample(this.str1, this.str2)
      };

      // Чтение файла как текст
      reader.readAsText(file);
    }
  }

  levenshteinDistance(str1: string | any[], str2: string | any[]) {
    this.str1 = str1;
    this.str2 = str2;
    console.log('слово 1', str1)
    console.log('в слово 2', str2)
    const matrix = [];

    for (let i = 0; i <= str1.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        const cost = (str1[i - 1] === str2[j - 1]) ? 0 : 1;

        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // удаление
          matrix[i][j - 1] + 1,      // вставка
          matrix[i - 1][j - 1] + cost // замена
        );

        // Транспозиция
        if (i > 1 && j > 1 && str1[i - 1] === str2[j - 2] && str1[i - 2] === str2[j - 1]) {
          matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
        }
      }
    }

    console.log("Матриця відстані Левенштейна:");
    this.printMatrix(matrix);

    console.log("\nОперації:");
    this.printOperations(str1, str2, matrix);

    this.minOperations = matrix[str1.length][str2.length];
    console.log(`\nМінімільна кількість операцій: ${this.minOperations}`);

    // @ts-ignore
    this.historyArr.push(`Слово 1 - ${str1}, Слово 2 - ${str2}, Мінімільна кількість операцій - ${this.minOperations}`)
    this.addToLocalStorage('arr', this.historyArr);
    return this.minOperations;
  }

  printMatrix(matrix: string | any[]) {
    this.matrixRow = [];
    for (let i = 0; i < matrix.length; i++) {
      const row = [];
      for (let j = 0; j < matrix[i].length; j++) {
        row.push(matrix[i][j]);
      }
      this.matrixRow.push(row);
    }
  }

  printOperations(str1: string | any[], str2: string | any[], matrix: string | any[]) {
    let i = matrix.length - 1;
    let j = matrix[0].length - 1;
    const operationsDiv = document.getElementById("operationsDiv");

    while (i > 0 || j > 0) {
      const currentCost = matrix[i][j];
      const deletionCost = (i > 0) ? matrix[i - 1][j] : Number.MAX_VALUE;
      const insertionCost = (j > 0) ? matrix[i][j - 1] : Number.MAX_VALUE;
      const substitutionCost = (i > 0 && j > 0) ? matrix[i - 1][j - 1] : Number.MAX_VALUE;

      if (currentCost === deletionCost + 1) {
        console.log(`Видалити ${str1[i - 1]}`);
        this.operations.push(`Видалити ${str1[i - 1]}`)
        i--;
      } else if (currentCost === insertionCost + 1) {
        console.log(`Вставити ${str2[j - 1]}`);
        this.operations.push(`Вставити ${str2[j - 1]}`)
        j--;
      } else {
        if (currentCost === substitutionCost) {
          console.log(`Залишити ${str1[i - 1]}`);
          this.operations.push(`Залишити ${str1[i - 1]}`)
        } else {
          console.log(`Замінити ${str1[i - 1]} на ${str2[j - 1]}`);
          this.operations.push(`Замінити ${str1[i - 1]} на ${str2[j - 1]}`)
        }
        i--;
        j--;
      }
    }
  }

  runOperationsWithInterval(interval?: number) {
    this.showNextStep = false;
    if (interval) {
      setInterval(() => {
        if (!this.stopRunning) {
          this.nextOperationStep();
        }
      }, interval)
    } else {
      setInterval(() => {
        if (!this.stopRunning) {
          this.nextOperationStep();
        }
      }, 2000)
    }
  }

  nextOperationStep() {
    this.currentOperationIndex++;
  }

  nextStep() {
    this.counter = this.counter + 1;
  }

  runInMoment() {
    this.counter = 100;
    this.currentOperationIndex = 100;
  }

  changePage(page: string) {
    this.page = page
  }

  pause() {
    this.stopRunning = !this.stopRunning
    console.log(this.stopRunning)
  }

  stepBack() {
    this.currentOperationIndex--;
  }

  faster() {
    this.runOperationsWithInterval(500)
  }

  slower() {
    this.runOperationsWithInterval(5000)
  }

  runExample(str1: string, str2: string) {
    this.levenshteinDistance(str1, str2);
    this.isAlgorithmRunning = true;
    this.runWithInterval();
  }

  runWithInterval(interval?: number) {
    if (interval) {
      setInterval(() => {
        if (!this.stopRunning) {
          this.nextStep();
        }
      }, interval)
    } else {
      setInterval(() => {
        if (!this.stopRunning) {
          this.nextStep();
        }
      }, 2000)
    }
  }


  runAlgorithm() {
    // @ts-ignore
    const str1 = document.getElementById("inputStr1").value;
    // @ts-ignore
    const str2 = document.getElementById("inputStr2").value;
    if (str1.length > 0 && str2.length > 0) {
      this.levenshteinDistance(str1, str2);
      this.isAlgorithmRunning = true;
      this.runWithInterval();
    } else {
      console.log("Напишіть слова перед тим як запускати алгоритм");
      alert("Напишіть слова перед тим як запускати алгоритм");
    }
  }

  fillInputFields(inputString: string): void {
    const wordsMatch = inputString.match(/Слово 1 - (\w+), Слово 2 - (\w+)/);

    if (wordsMatch && wordsMatch.length === 3) {
      const word1 = wordsMatch[1];
      const word2 = wordsMatch[2];

      // Заполняем инпуты значениями
      const input1 = document.getElementById('inputStr1') as HTMLInputElement;
      const input2 = document.getElementById('inputStr2') as HTMLInputElement;

      if (input1 && input2) {
        input1.value = word1;
        input2.value = word2;
      } else {
        console.error('Не удалось найти элементы с нужными id');
      }
    } else {
      console.error('Не удалось извлечь слова из строки');
    }
  }


  addToLocalStorage(key: string, array: string[] | undefined) {
    localStorage.setItem(key, JSON.stringify(array));
  }

  getFromLocalStorage(key: string): any[] | undefined {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : [];
  }
}
