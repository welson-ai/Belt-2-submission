#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    symbol_short, Env, String,
};

#[contracttype]
pub enum DataKey {
    Counter,
    Message,
}

#[contract]
pub struct AppContract;

#[contractimpl]
impl AppContract {
    /// Increment BELT-2 counter by 1 and return new value
    pub fn increment(env: Env) -> u32 {
        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0);
        let new_count = count + 1;
        env.storage().instance().set(&DataKey::Counter, &new_count);
        env.events().publish((symbol_short!("INC"),), new_count);
        new_count
    }

    /// Get current counter value
    pub fn get_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0)
    }

    /// Set a message string
    pub fn set_message(env: Env, message: String) {
        env.storage().instance().set(&DataKey::Message, &message);
        env.events().publish((symbol_short!("MSG"),), message);
    }

    /// Get stored message
    pub fn get_message(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Message)
            .unwrap_or_else(|| String::from_str(&env, "Hello, Stellar!"))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn test_increment() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AppContract);
        let client = AppContractClient::new(&env, &contract_id);
        assert_eq!(client.increment(), 1);
        assert_eq!(client.increment(), 2);
        assert_eq!(client.get_count(), 2);
    }

    #[test]
    fn test_message() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AppContract);
        let client = AppContractClient::new(&env, &contract_id);
        client.set_message(&String::from_str(&env, "Hello World"));
        assert_eq!(
            client.get_message(),
            String::from_str(&env, "Hello World")
        );
    }
}
