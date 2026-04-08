const Switch = ({ value, children }: any) => {
  return (
    children.find((item: any) => item.props.switchCase == value) ??
    children.find((item: any) => item.props.switchDefault != null) ?? <></>
  );
};

export default Switch;
