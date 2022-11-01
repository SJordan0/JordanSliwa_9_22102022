/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import userEvent from '@testing-library/user-event'

describe("Given I am connected as an employee", () => {
  describe('When page it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When page back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe("When I am on Bills Page", () => {

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
    })

    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test('Then clic on one of iconEye, the modal should be displayed', () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const newBills = new Bills({
        document, onNavigate, store, bills: bills, localStorage: window.localStorage
      })
      const handleClickIconEye = jest.fn(newBills.handleClickIconEye)
      const eye = screen.getAllByTestId('icon-eye')
      eye[0].addEventListener('click', handleClickIconEye)
      userEvent.click(eye[0])
      expect(handleClickIconEye).toHaveBeenCalled()
      const modale = screen.getByTestId('modaleFile')
      expect(modale).toBeTruthy() 
      const billProofContainer = document.body.querySelector('.bill-proof-container')
      expect(billProofContainer).toBeTruthy()
  })

    test('Then clic on button newBill the newBill page be displayed', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = jest.fn();
      const newBills = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const handleClickNewBill = jest.fn(newBills.handleClickNewBill)
      const buttonNewBill = screen.getByTestId('btn-new-bill');
      buttonNewBill.addEventListener('click', handleClickNewBill)
      userEvent.click(buttonNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()

    })
  })
})
