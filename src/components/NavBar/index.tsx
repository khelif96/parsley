import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Badge from "@leafygreen-ui/badge";
import { palette } from "@leafygreen-ui/palette";
import DetailsOverlay from "components/DetailsOverlay";
import FiltersOverlay from "components/FiltersOverlay";
import Icon from "components/Icon";
import PopoverButton from "components/PopoverButton";
import SearchBar from "components/SearchBar";
import { StyledLink } from "components/styles";
import { QueryParams } from "constants/queryParams";
import { navbarHeight, size } from "constants/tokens";
import { useLogContext } from "context/LogContext";
import { useQueryParam } from "hooks/useQueryParam";
import { validateRegexp } from "utils/validators";
import SearchCount from "./SearchCount";
import UploadLink from "./UploadLink";

const { gray, white } = palette;

const NavBar: React.FC = () => {
  const [filters, setFilters] = useQueryParam<string[]>(
    QueryParams.Filters,
    []
  );
  const { hasLogs, clearLogs, setSearch, hasSearch, matchingSearchCount } =
    useLogContext();

  const handleSearch = (selected: string, value: string) => {
    if (selected === "search") {
      setSearch(value);
    } else if (selected === "filter" && !filters.includes(value)) {
      setFilters([...filters, value]);
    }
  };

  return (
    <Container>
      <FlexContainer>
        <LinkContainer>
          <Icon glyph="LobsterLogo" />
          <StyledLink css={navLinkStyles} href="https://wiki.corp.mongodb.com">
            Wiki
          </StyledLink>
          <UploadLink clearLogs={clearLogs} hasLogs={hasLogs} />
        </LinkContainer>
        <StyledSearchBar
          disabled={!hasLogs}
          onSubmit={handleSearch}
          validator={validateRegexp}
          validatorMessage="Invalid Regular Expression"
        />
        {hasSearch && (
          <SearchCount
            currentSearchIndex={0}
            matchingSearchCount={matchingSearchCount}
          />
        )}
      </FlexContainer>
      <ButtonContainer>
        <StyledButton
          buttonText={
            <span>
              Filters <Badge variant="green">{filters.length}</Badge>
            </span>
          }
        >
          <FiltersOverlay />
        </StyledButton>
        <StyledButton buttonText="Details" data-cy="details-button">
          <DetailsOverlay />
        </StyledButton>
      </ButtonContainer>
    </Container>
  );
};

const FlexContainer = styled.div`
  display: flex;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 ${size.xs};
  justify-self: flex-end;
`;

const StyledSearchBar = styled(SearchBar)`
  width: 60vw;
`;

const StyledButton = styled(PopoverButton)`
  margin: 0 ${size.xs};
`;

const LinkContainer = styled.div`
  display: flex;
  margin-right: ${size.l};
`;

const Container = styled.nav`
  align-items: center;
  background-color: ${white};
  border-bottom: 1px solid ${gray.light2};
  display: flex;
  height: ${navbarHeight};
  justify-content: space-between;
  padding: 0 ${size.s};
  position: static;
`;

const navLinkStyles = css`
  margin: 0 ${size.s};
`;

export default NavBar;
