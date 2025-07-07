
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    width: '50%',
    borderColor: '#aaa',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 35,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '50%',
    marginBottom: 10,
    borderRadius: 35,
    textAlign: 'center',
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
  },
});