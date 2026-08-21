
from typing import List


class BankUser:
    account_number : str
    payment_method : str
    amount : int




class BankService:
    transactions:List[BankUser]

    def __init__(self):
        pass

    def addTransaction(self,t:BankUser):
        for i in self.transactions:
            if i.account_number == t.account_number:
                print("acc")

        
        