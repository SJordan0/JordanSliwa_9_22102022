/**
 * @jest-environment jsdom
 */

 import { screen, fireEvent } from "@testing-library/dom"
 import NewBillUI from "../views/NewBillUI.js"
 import NewBill from "../containers/NewBill.js"
 import { localStorageMock } from "../__mocks__/localStorage.js"
 import { ROUTES } from '../constants/routes.js'
 import mockStore from "../__mocks__/store"
 
 
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
