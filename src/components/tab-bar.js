import styled from "styled-components";

const TabBar = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
`;

const Tab = styled.button`
  background: ${(p) => (p.selected === "true" ? "#ddd" : "#fff")};
  border: 1px solid;
  border-bottom-width: ${(p) => (p.selected === "true" ? "5px" : "1px")};
  width: 100%;
  display: block;
  height: 50px;

  & + & {
    border-left: 0;
  }

  label.subtitle {
    font-size: 16px;
  }
`;

export default function tabBar({ tabs }) {
  return (
    <TabBar>
      {tabs.map(function ({ subtitle, selected }, i) {
        let key = "button_" + i;
        return (
          <Tab selected={selected} subtitle={subtitle} key={key}>
            <label className="subtitle">{subtitle}</label>
          </Tab>
        );
      })}
    </TabBar>
  );
}
