import { 
  UncontrolledInput, 
  ControlledInput, 
  RegisterForm, 
  CommentBox, 
  LoginForm 
} from './components';



function App() {
  return (
    <>
      <ControlledInput />
      <br />
      <UncontrolledInput />
      <br />
      <CommentBox />
      <br />
      <RegisterForm />
      <br />
      <LoginForm />
    </>
  );
}

export default App;