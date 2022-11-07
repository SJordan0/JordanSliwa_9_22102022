/**
 * @jest-environment jsdom
 */

 import { screen, fireEvent } from "@testing-library/dom"
 import NewBillUI from "../views/NewBillUI.js"
 import NewBill from "../containers/NewBill.js"
 import { localStorageMock } from "../__mocks__/localStorage.js"
 import { ROUTES } from '../constants/routes.js'
 import mockStore from "../__mocks__/store"
 import BillsUI from "../views/BillsUI.js"
 import router from "../app/Router"

 jest.mock("../app/Store", () => mockStore)
 
 describe("Given I am connected as an employee and on NewBill Page", () => {
   beforeEach(() => {
     Object.defineProperty(window, 'localStorage', { value: localStorageMock })// Set localStorage
     window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))// Set user as Employee in localStorage
     const html = NewBillUI()
     document.body.innerHTML = html
 
   })
   describe("When I select a file", () => {
     test("Then it should be changed in the input", () => {
       const newBill = new NewBill({
         document,
         onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
         store: mockStore,
         localStorage: window.localStorage
       })
       const handleChangeFile = jest.fn(newBill.handleChangeFile)
       const inputFile = screen.getByTestId("file")
       inputFile.addEventListener('change', handleChangeFile)
       fireEvent.change(inputFile, {
         target: {
           files: [new File(["myFile.png"], "myFile.png", { type: "image/png" })]
         }
       })
       expect(handleChangeFile).toHaveBeenCalled();
       expect(inputFile.files[0].name).toBe("myFile.png");
     })
   })
   describe("When I submit the form", () => {
     test('It should create a new bill', () => {
       const newBill = new NewBill({
         document,
         onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
         store: mockStore,
         localStorage: window.localStorage
       })
       const handleSubmit = jest.fn(newBill.handleSubmit)
       const newBillform = screen.getByTestId("form-new-bill")
       newBillform.addEventListener('submit', handleSubmit)
       fireEvent.submit(newBillform)
       expect(handleSubmit).toHaveBeenCalled()
     })
   })
 })

 // test d'intégration Post
describe("Given I am connected as an employee and on NewBill Page", () => {
  describe("When I submit the form", () => {
    test('It should create a new bill', async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })// Set localStorage
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))// Set user as Employee in localStorage
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({
        document,
        onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
        store: mockStore,
        localStorage: window.localStorage
      })
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const newBillform = screen.getByTestId("form-new-bill")
      newBillform.addEventListener('submit', handleSubmit)
      const date = "2002-02-02"
      const amount = "100"
      const pct = "10"
      const inputDate = screen.getByTestId("datepicker")
      const inputAmount = screen.getByTestId("amount")
      const inputPct = screen.getByTestId("pct")
      const inputFile = screen.getByTestId("file")
      fireEvent.change(inputDate, { target: { value: date } })
      fireEvent.change(inputAmount, { target: { value: amount } })
      fireEvent.change(inputPct, { target: { value: pct } })
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["myFile.png"], "myFile.png", { type: "image/png" })]
        }
      })
      fireEvent.submit(newBillform)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills") //fonction simulée qui surveille l'appel de la méthode bills de l'objet store
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("It should create a new bill but fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => { // simule un rejet de la promesse
        return {
          create: () => {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      document.body.innerHTML = BillsUI({ error: "Erreur 404" })
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("It should create a new bill but fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })
      document.body.innerHTML = BillsUI({ error: "Erreur 500" })
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

})