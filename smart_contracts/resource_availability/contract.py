from algopy import *
from algopy.arc4 import abimethod

# STEP 3: Replace the following constants with the values you get after building and running the setup
COUNTER_APP_ID = 1131
HELLO_DEV_ASSET_ID = 1164
ALICE_ADDRESS = '5EQOFNPSRNI6XT3QWKB3TLGIPBHW4OBDYIMAYRAKSLRC23QAHLB2TR5CKE'

COUNTER_BOX_KEY_LENGTH = 32
COUNTER_BOX_VALUE_LENGTH = 8
COUNTER_BOX_SIZE = COUNTER_BOX_KEY_LENGTH + COUNTER_BOX_VALUE_LENGTH
COUNTER_BOX_MBR = 2_500 + COUNTER_BOX_SIZE * 400

class Counter(ARC4Contract):

    def __init__(self) -> None:
        self.counter = UInt64(0)
        self.my_counter = LocalState(UInt64)
        self.box_counter = BoxMap(Account, UInt64)

    @abimethod
    def increment(self) -> UInt64:
        self.counter += 1
        return self.counter

    @abimethod(allow_actions=["OptIn"])
    def opt_in(self) -> None:
        self.my_counter[Txn.sender] = UInt64(0)
    
    @abimethod
    def increment_my_counter(self) -> UInt64:
        assert Txn.sender.is_opted_in(Global.current_application_id)

        self.my_counter[Txn.sender] += 1
        return self.my_counter[Txn.sender]
    
    @abimethod 
    def increment_box_counter(self, payMbr: gtxn.PaymentTransaction) -> UInt64:
        assert payMbr.amount == COUNTER_BOX_MBR
        assert payMbr.receiver == Global.current_application_address
        
        if Txn.sender in self.box_counter:
            self.box_counter[Txn.sender] += 1
        else:
            self.box_counter[Txn.sender] = UInt64(0)
            self.box_counter[Txn.sender] += 1

        return self.box_counter[Txn.sender]
    

class ResourceAvailability(ARC4Contract):

    @abimethod()
    def get_account_balance(self) -> UInt64:
        return Account(ALICE_ADDRESS).balance

    @abimethod()
    def get_account_balance_with_arg(self, acct: Account) -> UInt64:
        return acct.balance

    @abimethod()
    def get_asset_total_supply(self) -> UInt64:
        return Asset(HELLO_DEV_ASSET_ID).total
    
    @abimethod()
    def get_asset_total_supply_with_arg(self, asa: Asset) -> UInt64:
        return asa.total
    
    @abimethod()
    def get_app_global_num_uint(self) -> UInt64:
        return Application(COUNTER_APP_ID).global_num_uint
    
    @abimethod()
    def get_app_global_num_uint_with_arg(self, app: Application) -> UInt64:
        return app.global_num_uint


    @abimethod()
    def increment_via_inner(self) -> UInt64:
        app = Application(COUNTER_APP_ID)

        counter_result, call_txn = arc4.abi_call(
            Counter.increment,
            fee=0,
            app_id=app,
        )
        return counter_result
    
    @abimethod()
    def increment_via_inner_with_arg(self, app: Application) -> UInt64:
        counter_result, call_txn = arc4.abi_call(
            Counter.increment,
            fee=0,
            app_id=app
        )
        return counter_result
    
    # Account + Asset examples
    @abimethod
    def get_asset_balance(self) -> UInt64:
        acct = Account(ALICE_ADDRESS)
        asset = Asset(HELLO_DEV_ASSET_ID)
        balance, has_value = op.AssetHoldingGet.asset_balance(acct, asset)
        
        if has_value:
            return balance
        return UInt64(0)
    
    @abimethod
    def get_asset_balance_with_arg(self, acct: Account, asset: Asset) -> UInt64:
        balance, has_value = op.AssetHoldingGet.asset_balance(acct, asset)
        
        if has_value:
            return balance
        return UInt64(0)
                       
    # Account + Application examples
    @abimethod
    def get_my_counter(self) -> UInt64:
        acct = Account(ALICE_ADDRESS)
        app = Application(COUNTER_APP_ID)
        my_count, exist =op.AppLocal.get_ex_uint64(acct, app, b"my_counter")
        if exist:
            return my_count
        return UInt64(0)

    @abimethod
    def get_my_counter_with_arg(self, acct: Account, app: Application) -> UInt64:
        my_count, exist =op.AppLocal.get_ex_uint64(acct, app, b"my_counter")
        if exist:
            return my_count
        return UInt64(0)
