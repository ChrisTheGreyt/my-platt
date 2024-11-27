// src/components/AuthTest.tsx

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { setUser } from "@/state/authSlice";

const TestRedux = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  const testDispatch = () => {
    dispatch(
      setUser({
        user: {
          attributes: { sub: "mockSub", email: "mock@example.com" },
          username: "mockUser",
        },
        userSub: "mockSub",
        userDetails: {
          userId: 123,
          selectedTrack: "2025",
          email: "mock@example.com",
          firstName: "Mock",
          lastName: "User",
          subscriptionStatus: "active",
          profilePictureUrl: "",
        },
      })
    );
  };

  return (
    <div>
      <button onClick={testDispatch}>Test Redux Dispatch</button>
      <pre>{JSON.stringify(authState, null, 2)}</pre>
    </div>
  );
};

export default TestRedux;
