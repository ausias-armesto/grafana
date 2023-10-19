import { css } from '@emotion/css';
import React, { useEffect, useMemo } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import { CellProps, InteractiveTable, Icon, Column, Avatar, useStyles2 } from '@grafana/ui';
import { Stack } from '@grafana/ui/src/unstable';
import { StoreState, Team } from 'app/types';

import { Page } from '../../core/components/Page/Page';
import { TableWrapper } from '../admin/Users/TableWrapper';

import { loadUsersTeams } from './state/actions';

type Cell<T extends keyof Team = keyof Team> = CellProps<Team, Team[T]>;
export interface OwnProps {}

export const UserTeamsList = ({ teams, noTeams, hasFetched, loadUsersTeams }: Props) => {
  const styles = useStyles2(getStyles);

  useEffect(() => {
    loadUsersTeams(true);
  }, [loadUsersTeams]);

  const columns: Array<Column<Team>> = useMemo(
    () => [
      {
        id: 'avatarUrl',
        header: '',
        cell: ({ cell: { value } }: Cell<'avatarUrl'>) => value && <Avatar src={value} alt="User avatar" />,
      },
      {
        id: 'name',
        header: 'Name',
        cell: ({ cell: { value } }: Cell<'name'>) => value,
      },
    ],
    []
  );

  if (noTeams) {
    return (
      <Page navId="profile/teams">
        <div className={styles.noTeamsWrapper}>
          <Icon name="users-alt" size="xxl" />
          <span>You are currently not a member of any teams.</span>
        </div>
      </Page>
    );
  }

  return (
    <Page navId="profile/teams">
      <Page.Contents isLoading={!hasFetched}>
        {
          <>
            <Stack gap={2}>
              <TableWrapper>
                <InteractiveTable columns={columns} data={teams} getRowId={(team) => String(team.id)} />
              </TableWrapper>
            </Stack>
          </>
        }
      </Page.Contents>
    </Page>
  );
};

function getStyles(theme: GrafanaTheme2) {
  return {
    noTeamsWrapper: css({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.spacing(1),
    }),
  };
}

function mapStateToProps(state: StoreState) {
  return {
    teams: state.teams.teams,
    noTeams: state.teams.noTeams,
    hasFetched: state.teams.hasFetched,
  };
}

const mapDispatchToProps = {
  loadUsersTeams,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(UserTeamsList);